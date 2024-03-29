// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// K8sInstallerConfigSpec defines the desired state of K8sInstallerConfig
    /// </summary>
    [OutputType]
    public sealed class K8sInstallerConfigSpec
    {
        /// <summary>
        /// BundleRepo is the OCI registry from which the carvel imgpkg bundle will be downloaded
        /// </summary>
        public readonly string BundleRepo;
        /// <summary>
        /// BundleType is the type of bundle (e.g. k8s) that needs to be downloaded
        /// </summary>
        public readonly string BundleType;

        [OutputConstructor]
        private K8sInstallerConfigSpec(
            string bundleRepo,

            string bundleType)
        {
            BundleRepo = bundleRepo;
            BundleType = bundleType;
        }
    }
}
