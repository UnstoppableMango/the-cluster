// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    public class ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserArgs : global::Pulumi.ResourceArgs
    {
        [Input("bootcmd")]
        private InputList<string>? _bootcmd;
        public InputList<string> Bootcmd
        {
            get => _bootcmd ?? (_bootcmd = new InputList<string>());
            set => _bootcmd = value;
        }

        [Input("ca_certs")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserCaCertsArgs>? Ca_certs { get; set; }

        [Input("chpasswd")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserChpasswdArgs>? Chpasswd { get; set; }

        [Input("manage_etc_hosts")]
        public Input<bool>? Manage_etc_hosts { get; set; }

        [Input("no_ssh_fingerprints")]
        public Input<bool>? No_ssh_fingerprints { get; set; }

        [Input("package_update")]
        public Input<bool>? Package_update { get; set; }

        [Input("package_upgrade")]
        public Input<bool>? Package_upgrade { get; set; }

        [Input("packages")]
        private InputList<string>? _packages;
        public InputList<string> Packages
        {
            get => _packages ?? (_packages = new InputList<string>());
            set => _packages = value;
        }

        [Input("password")]
        public Input<string>? Password { get; set; }

        [Input("runCmd")]
        private InputList<string>? _runCmd;
        public InputList<string> RunCmd
        {
            get => _runCmd ?? (_runCmd = new InputList<string>());
            set => _runCmd = value;
        }

        [Input("ssh")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserSshArgs>? Ssh { get; set; }

        [Input("ssh_authorized_keys")]
        private InputList<string>? _ssh_authorized_keys;
        public InputList<string> Ssh_authorized_keys
        {
            get => _ssh_authorized_keys ?? (_ssh_authorized_keys = new InputList<string>());
            set => _ssh_authorized_keys = value;
        }

        [Input("ssh_keys")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserSshKeysArgs>? Ssh_keys { get; set; }

        [Input("ssh_pwauth")]
        public Input<bool>? Ssh_pwauth { get; set; }

        [Input("user")]
        public Input<string>? User { get; set; }

        [Input("users")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserUsersArgs>? _users;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserUsersArgs> Users
        {
            get => _users ?? (_users = new InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserUsersArgs>());
            set => _users = value;
        }

        [Input("writeFiles")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserWriteFilesArgs>? _writeFiles;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserWriteFilesArgs> WriteFiles
        {
            get => _writeFiles ?? (_writeFiles = new InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserWriteFilesArgs>());
            set => _writeFiles = value;
        }

        public ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserArgs()
        {
        }
        public static new ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserArgs Empty => new ProxmoxMachineTemplateSpecTemplateSpecCloudInitUserArgs();
    }
}
