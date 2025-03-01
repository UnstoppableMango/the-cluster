// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Pulumi.V1
{

    /// <summary>
    /// (optional) GitAuth allows configuring git authentication options There are 3 different authentication options: * SSH private key (and its optional password) * Personal access token * Basic auth username and password Only one authentication mode will be considered if more than one option is specified, with ssh private key/password preferred first, then personal access token, and finally basic auth credentials.
    /// </summary>
    [OutputType]
    public sealed class StackSpecGitAuth
    {
        /// <summary>
        /// ResourceRef identifies a resource from which information can be loaded. Environment variables, files on the filesystem, Kubernetes Secrets and literal strings are currently supported.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthAccessToken AccessToken;
        /// <summary>
        /// BasicAuth configures git authentication through basic auth — i.e. username and password. Both UserName and Password are required.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthBasicAuth BasicAuth;
        /// <summary>
        /// SSHAuth configures ssh-based auth for git authentication. SSHPrivateKey is required but password is optional.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthSshAuth SshAuth;

        [OutputConstructor]
        private StackSpecGitAuth(
            Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthAccessToken accessToken,

            Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthBasicAuth basicAuth,

            Pulumi.Kubernetes.Types.Outputs.Pulumi.V1.StackSpecGitAuthSshAuth sshAuth)
        {
            AccessToken = accessToken;
            BasicAuth = basicAuth;
            SshAuth = sshAuth;
        }
    }
}
