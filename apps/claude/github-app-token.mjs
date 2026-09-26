// Keeps gh logged in as the GitHub App, and so git too: Home Manager's
// programs.gh makes `gh auth git-credential` the helper for github.com.
// Installation tokens expire after an hour, so this mints a fresh one ahead
// of each expiry and writes it where gh reads its login.
//
// An installation token covers one account, and the App is installed on
// several. gh holds the primary installation's token, the one the secret
// names. Every installation's token is also written to a file named for its
// account, and git reads each other account's file through a credential entry
// scoped to https://github.com/<account>. For gh against another account, run
// it with GH_TOKEN set from that file.
//
// Node rather than a shell script because the image has no openssl or curl,
// and node:crypto can sign the RS256 JWT the App authenticates with.
import { execFileSync } from "node:child_process";
import { createPrivateKey, sign } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const secretDir = "/var/run/secrets/github-app";
const home = process.env.HOME;
const hostsFile = join(home, ".config/gh/hosts.yml");
// The seam dotfiles' git module includes for machine-local config.
const gitLocalConfig = join(home, ".config/git/config.local");
const tokenDir = join(home, ".local/state/github-app");

const refreshBefore = 15 * 60 * 1000;
const retryAfter = 60 * 1000;

const readSecret = (key) => readFileSync(join(secretDir, key), "utf8").trim();
const appId = readSecret("github_app_id");
const installationId = readSecret("github_app_installation_id");
const privateKey = createPrivateKey(readSecret("github_app_private_key"));

const base64url = (data) => Buffer.from(data).toString("base64url");

function appJwt() {
	const now = Math.floor(Date.now() / 1000);
	const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	// Backdated for clock drift; GitHub caps exp at ten minutes out.
	const claims = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
	const signature = sign("RSA-SHA256", Buffer.from(`${header}.${claims}`), privateKey);
	return `${header}.${claims}.${base64url(signature)}`;
}

async function github(method, path, auth) {
	const res = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${auth}`,
			"User-Agent": "the-cluster-claude",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});
	if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
	return res.json();
}

// Written whole and renamed into place, so gh never reads half a file.
function writeAtomic(path, data) {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.tmp`;
	writeFileSync(tmp, data, { mode: 0o600 });
	renameSync(tmp, path);
}

// JSON strings are valid YAML scalars, and the login has brackets in it.
function writeHosts(login, token) {
	const [l, t] = [JSON.stringify(login), JSON.stringify(token)];
	writeAtomic(hostsFile, [
		"github.com:",
		"    git_protocol: https",
		"    users:",
		`        ${l}:`,
		`            oauth_token: ${t}`,
		`    oauth_token: ${t}`,
		`    user: ${l}`,
		"",
	].join("\n"));
}

const gitConfig = (...args) => execFileSync("git", ["config", "--file", gitLocalConfig, ...args]);

// The empty helper clears the list git has built so far, so gh's token for the
// primary account is never offered to this one.
const credentialsWritten = new Set();
function writeCredential(account, tokenFile) {
	if (credentialsWritten.has(account)) return;
	const key = `credential.https://github.com/${account}.helper`;
	try {
		gitConfig("--unset-all", key);
	} catch {
		// Not set yet.
	}
	gitConfig("--add", key, "");
	gitConfig("--add", key, `!f() { echo username=x-access-token; echo "password=$(cat ${tokenFile})"; }; f`);
	credentialsWritten.add(account);
}

// The noreply address is what links a commit to the bot account on GitHub,
// and its numeric prefix is the bot user's id, not the App's.
async function writeIdentity(login, token) {
	const user = await github("GET", `/users/${encodeURIComponent(login)}`, token);
	mkdirSync(dirname(gitLocalConfig), { recursive: true });
	gitConfig("user.name", "Claude");
	gitConfig("user.email", `${user.id}+${login}@users.noreply.github.com`);
	console.log(`git identity: Claude <${user.id}+${login}@users.noreply.github.com>`);
}

let login;
let identityWritten = false;
for (;;) {
	try {
		const jwt = appJwt();
		login ??= `${(await github("GET", "/app", jwt)).slug}[bot]`;
		// Listed every round, so an account the App is newly installed on is
		// picked up within the hour.
		const installations = await github("GET", "/app/installations?per_page=100", jwt);
		let expiry = Infinity;
		for (const { id, account } of installations) {
			const { token, expires_at } = await github("POST", `/app/installations/${id}/access_tokens`, jwt);
			const tokenFile = join(tokenDir, account.login);
			writeAtomic(tokenFile, `${token}\n`);
			if (String(id) === installationId) {
				writeHosts(login, token);
				if (!identityWritten) {
					await writeIdentity(login, token);
					identityWritten = true;
				}
			} else {
				writeCredential(account.login, tokenFile);
			}
			expiry = Math.min(expiry, Date.parse(expires_at));
			console.log(`token for ${account.login} expires ${expires_at}`);
		}
		await sleep(Math.max(expiry - Date.now() - refreshBefore, retryAfter));
	} catch (err) {
		console.error(err.message);
		await sleep(retryAfter);
	}
}
