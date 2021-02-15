import { Input } from '@pulumi/pulumi';

type RollingUpdateDeployment = {
  maxSurge?: Input<number | string>;
  maxUnavailable?: Input<number | string>;
}

type DeploymentStrategy = {
  rollingUpdate?: RollingUpdateDeployment;
}

export const stopStartNew = (): RollingUpdateDeployment => ({
  maxSurge: 0, maxUnavailable: '100%',
});

export const stopStartNewStrategy = (): DeploymentStrategy => ({
  rollingUpdate: stopStartNew(),
});
