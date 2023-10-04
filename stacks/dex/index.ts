import * as pulumi from "@pulumi/pulumi";
import * as k8s from '@pulumi/kubernetes';

const ns = new k8s.core.v1.Namespace('dex', {
    metadata: { name: 'dex' },
});

const chart = new k8s.helm.v3.Chart('dex', {
    path: './',
    namespace: ns.metadata.name,
    values: {
        config: {
            issuer: 'TODO',
            storage: { type: 'memory' },
            
        },
    },
});
