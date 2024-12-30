import { ConfigFile } from '@pulumi/kubernetes/yaml/v2';

const version = '2.1.0';

const release = new ConfigFile('wireguard-operator', {
  file: `https://github.com/jodevsa/wireguard-operator/releases/download/v${version}/release.yaml`,
});
