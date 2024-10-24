// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Pulumi.V1Alpha1
{

    /// <summary>
    /// SSHAuth configures ssh-based auth for git authentication. SSHPrivateKey is required but password is optional.
    /// </summary>
    public class StackSpecGitAuthSshAuthArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// ResourceRef identifies a resource from which information can be loaded. Environment variables, files on the filesystem, Kubernetes Secrets and literal strings are currently supported.
        /// </summary>
        [Input("password")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Pulumi.V1Alpha1.StackSpecGitAuthSshAuthPasswordArgs>? Password { get; set; }

        /// <summary>
        /// ResourceRef identifies a resource from which information can be loaded. Environment variables, files on the filesystem, Kubernetes Secrets and literal strings are currently supported.
        /// </summary>
        [Input("sshPrivateKey", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Pulumi.V1Alpha1.StackSpecGitAuthSshAuthSshPrivateKeyArgs> SshPrivateKey { get; set; } = null!;

        public StackSpecGitAuthSshAuthArgs()
        {
        }
        public static new StackSpecGitAuthSshAuthArgs Empty => new StackSpecGitAuthSshAuthArgs();
    }
}
