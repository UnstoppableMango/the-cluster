import { Namespace, Project } from '@pulumi/rancher2';
import { CodeServer } from './resources';

const project = new Project('dev', {
  name: 'Dev',
  clusterId: 'local',
});
