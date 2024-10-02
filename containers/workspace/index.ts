import * as pulumi from "@pulumi/pulumi";
import * as docker from '@pulumi/docker-build';

const config = new pulumi.Config();
const platforms = config.getObject<docker.Platform[]>('platforms')

const image = new docker.Image('workspace', {
  push: false,
  context: {
    location: config.require('context'),
  },
  dockerfile: {
    location: './Dockerfile',
  },
  platforms,
  exports: [{ cacheonly: {} }],
  tags: [config.require('imageName')],
});
