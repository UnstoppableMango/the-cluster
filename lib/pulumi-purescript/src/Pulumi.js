import * as pulumi from '@pulumi/pulumi';

export function output(value) {
    return pulumi.output(value);
}
