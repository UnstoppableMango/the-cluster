// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1
{

    /// <summary>
    /// ResourceRef identifies a resource from which information can be loaded. Environment variables, files on the filesystem, Kubernetes Secrets and literal strings are currently supported.
    /// </summary>
    [OutputType]
    public sealed class StackSpecEnvRefs
    {
        /// <summary>
        /// Env selects an environment variable set on the operator process
        /// </summary>
        public readonly global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsEnv Env;
        /// <summary>
        /// FileSystem selects a file on the operator's file system
        /// </summary>
        public readonly global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsFilesystem Filesystem;
        /// <summary>
        /// LiteralRef refers to a literal value
        /// </summary>
        public readonly global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsLiteral Literal;
        /// <summary>
        /// SecretRef refers to a Kubernetes Secret
        /// </summary>
        public readonly global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsSecret Secret;
        /// <summary>
        /// SelectorType is required and signifies the type of selector. Must be one of: Env, FS, Secret, Literal
        /// </summary>
        public readonly string Type;

        [OutputConstructor]
        private StackSpecEnvRefs(
            global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsEnv env,

            global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsFilesystem filesystem,

            global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsLiteral literal,

            global::Pulumi.Kubernetes.Types.Outputs.Pulumi.V1Alpha1.StackSpecEnvRefsSecret secret,

            string type)
        {
            Env = env;
            Filesystem = filesystem;
            Literal = literal;
            Secret = secret;
            Type = type;
        }
    }
}