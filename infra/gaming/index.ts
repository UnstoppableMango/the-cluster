import { Namespace } from "@pulumi/kubernetes/core/v1";

const gamingDefault = new Namespace('gaming-default', {
  metadata: { name: 'gaming-default' },
});

const shulkerSystem = new Namespace('shulker-system', {
  metadata: { name: 'shulker-system' },
});

export const namespaces = [
  gamingDefault.metadata.name,
  shulkerSystem.metadata.name,
];
