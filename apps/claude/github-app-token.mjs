// Keeps gh logged in as the GitHub App, and so git too: Home Manager's
// programs.gh makes `gh auth git-credential` the helper for github.com.
// Installation tokens expire after an hour, so this mints a fresh one ahead
// of each expiry and writes it where gh reads its login.
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

// The noreply address is what links a commit to the bot account on GitHub,
// and its numeric prefix is the bot user's id, not the App's.
async function writeIdentity(login, token) {
	const user = await github("GET", `/users/${encodeURIComponent(login)}`, token);
	mkdirSync(dirname(gitLocalConfig), { recursive: true });
	const set = (key, value) => execFileSync("git", ["config", "--file", gitLocalConfig, key, value]);
	set("user.name", "Claude");
	set("user.email", `${user.id}+${login}@users.noreply.github.com`);
	console.log(`git identity: Claude <${user.id}+${login}@users.noreply.github.com>`);
}

let login;
let identityWritten = false;
for (;;) {
	try {
		const jwt = appJwt();
		login ??= `${(await github("GET", "/app", jwt)).slug}[bot]`;
		const { token, expires_at } = await github(
			"POST",
			`/app/installations/${installationId}/access_tokens`,
			jwt,
		);
		writeHosts(login, token);
		if (!identityWritten) {
			await writeIdentity(login, token);
			identityWritten = true;
		}
		const expiry = Date.parse(expires_at);
		console.log(`token for ${login} expires ${expires_at}`);
		await sleep(Math.max(expiry - Date.now() - refreshBefore, retryAfter));
	} catch (err) {
		console.error(err.message);
		await sleep(retryAfter);
	}
}
