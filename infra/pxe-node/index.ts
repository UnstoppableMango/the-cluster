import * as path from 'path';
import * as pulumi from '@pulumi/pulumi';
import * as libvirt from '@pulumi/libvirt';

const stack = pulumi.getStack();

// const pool = new libvirt.Pool('pool', {
//   type: 'dir',
//   path: path.join(__dirname, 'pools', stack),
// });

const domain = new libvirt.Domain('domain', {
  name: stack,
  vcpu: 1,
  memory: 2048,
  graphics: {
    type: '',
  }
});
