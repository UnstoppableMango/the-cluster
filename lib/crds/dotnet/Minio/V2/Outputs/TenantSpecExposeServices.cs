// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Minio.V2
{

    [OutputType]
    public sealed class TenantSpecExposeServices
    {
        public readonly bool Console;
        public readonly bool Minio;

        [OutputConstructor]
        private TenantSpecExposeServices(
            bool console,

            bool minio)
        {
            Console = console;
            Minio = minio;
        }
    }
}