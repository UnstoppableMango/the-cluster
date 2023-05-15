import * as pulumi from "@pulumi/pulumi";
import * as proxmox from '@muhlba91/pulumi-proxmoxve';

const config = new pulumi.Config();

config.getSecret('endpoint')?.apply(x => console.log(x))

const provider = new proxmox.Provider('proxmoxve', {
  virtualEnvironment: {
    endpoint: config.getSecret('endpoint'),
    insecure: false,
    username: config.getSecret('username'),
    password: config.getSecret('password'),
  }
});

proxmox.storage.getDatastores({
  nodeName: 'zeus',
}, { provider: provider }).then(x => console.log(x));

