import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { extract } from '../util';

const fileNames: Record<string, string> = {
  crt: 'ca.rsa.2048.crt',
  ovpn: 'CA Montreal.ovpn',
  pem: 'crl.rsa.2048.pem',
};

export interface OpenVpnConfig {
  'ca.rsa.2048.crt': string;
  'CA_Montreal.ovpn': string;
  'crl.rsa.2048.pem': string;
}

export async function getOpenVpnConfig(zipFile: string): Promise<OpenVpnConfig> {
  const zipDir = path.join(os.tmpdir(), 'openvpn');
  
  if (!existsSync(zipDir))
    await extract(zipFile, zipDir);

  const paths = getPaths(zipDir);

  const crt = await fs.readFile(paths.crt, { encoding: 'utf8' });
  const ovpn = await fs.readFile(paths.ovpn, { encoding: 'utf8' });
  const pem = await fs.readFile(paths.pem, { encoding: 'utf8' });

  return {
    'ca.rsa.2048.crt': crt,
    'CA_Montreal.ovpn': ovpn,
    'crl.rsa.2048.pem': pem,
  };
}


const getPaths = (zipDir: string) => {
  const join = (file: string) => path.join(zipDir, file);

  return {
    ovpn: join(fileNames.ovpn),
    crt: join(fileNames.crt),
    pem: join(fileNames.pem),
  };
};
