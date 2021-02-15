import { Namespace, Project } from '@pulumi/rancher2';
import { CodeServer } from './resources';

const project = new Project('dev', {
  name: 'Dev',
  clusterId: 'local',
});

const codeServerNs = new Namespace('code-server', {
  name: 'code-server',
  projectId: project.id,
});

const codeServer = new CodeServer('code-server', {
  namespace: codeServerNs.name,
});
