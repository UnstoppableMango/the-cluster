// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1
{

    /// <summary>
    /// StackSpec defines the desired state of Pulumi Stack being managed by this operator.
    /// </summary>
    public class StackSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// (optional) AccessTokenSecret is the name of a Secret containing the PULUMI_ACCESS_TOKEN for Pulumi access. Deprecated: use EnvRefs with a "secret" entry with the key PULUMI_ACCESS_TOKEN instead.
        /// </summary>
        [Input("accessTokenSecret")]
        public Input<string>? AccessTokenSecret { get; set; }

        /// <summary>
        /// (optional) Backend is an optional backend URL to use for all Pulumi operations.&lt;br/&gt; Examples:&lt;br/&gt; - Pulumi Service:              "https://app.pulumi.com" (default)&lt;br/&gt; - Self-managed Pulumi Service: "https://pulumi.acmecorp.com" &lt;br/&gt; - Local:                       "file://./einstein" &lt;br/&gt; - AWS:                         "s3://&lt;my-pulumi-state-bucket&gt;" &lt;br/&gt; - Azure:                       "azblob://&lt;my-pulumi-state-bucket&gt;" &lt;br/&gt; - GCP:                         "gs://&lt;my-pulumi-state-bucket&gt;" &lt;br/&gt; See: https://www.pulumi.com/docs/intro/concepts/state/
        /// </summary>
        [Input("backend")]
        public Input<string>? Backend { get; set; }

        /// <summary>
        /// (optional) Branch is the branch name to deploy, either the simple or fully qualified ref name, e.g. refs/heads/master. This is mutually exclusive with the Commit setting. Either value needs to be specified. When specified, the operator will periodically poll to check if the branch has any new commits. The frequency of the polling is configurable through ResyncFrequencySeconds, defaulting to every 60 seconds.
        /// </summary>
        [Input("branch")]
        public Input<string>? Branch { get; set; }

        /// <summary>
        /// (optional) Commit is the hash of the commit to deploy. If used, HEAD will be in detached mode. This is mutually exclusive with the Branch setting. Either value needs to be specified.
        /// </summary>
        [Input("commit")]
        public Input<string>? Commit { get; set; }

        [Input("config")]
        private InputMap<string>? _config;

        /// <summary>
        /// (optional) Config is the configuration for this stack, which can be optionally specified inline. If this is omitted, configuration is assumed to be checked in and taken from the source repository.
        /// </summary>
        public InputMap<string> Config
        {
            get => _config ?? (_config = new InputMap<string>());
            set => _config = value;
        }

        /// <summary>
        /// (optional) ContinueResyncOnCommitMatch - when true - informs the operator to continue trying to update stacks even if the revision of the source matches. This might be useful in environments where Pulumi programs have dynamic elements for example, calls to internal APIs where GitOps style commit tracking is not sufficient.  Defaults to false, i.e. when a particular revision is successfully run, the operator will not attempt to rerun the program at that revision again.
        /// </summary>
        [Input("continueResyncOnCommitMatch")]
        public Input<bool>? ContinueResyncOnCommitMatch { get; set; }

        /// <summary>
        /// (optional) DestroyOnFinalize can be set to true to destroy the stack completely upon deletion of the Stack custom resource.
        /// </summary>
        [Input("destroyOnFinalize")]
        public Input<bool>? DestroyOnFinalize { get; set; }

        [Input("envRefs")]
        private InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecEnvRefsArgs>? _envRefs;

        /// <summary>
        /// (optional) EnvRefs is an optional map containing environment variables as keys and stores descriptors to where the variables' values should be loaded from (one of literal, environment variable, file on the filesystem, or Kubernetes Secret) as values.
        /// </summary>
        public InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecEnvRefsArgs> EnvRefs
        {
            get => _envRefs ?? (_envRefs = new InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecEnvRefsArgs>());
            set => _envRefs = value;
        }

        [Input("envSecrets")]
        private InputList<string>? _envSecrets;

        /// <summary>
        /// (optional) SecretEnvs is an optional array of Secret names containing environment variables to set. Deprecated: use EnvRefs instead.
        /// </summary>
        public InputList<string> EnvSecrets
        {
            get => _envSecrets ?? (_envSecrets = new InputList<string>());
            set => _envSecrets = value;
        }

        [Input("envs")]
        private InputList<string>? _envs;

        /// <summary>
        /// (optional) Envs is an optional array of config maps containing environment variables to set. Deprecated: use EnvRefs instead.
        /// </summary>
        public InputList<string> Envs
        {
            get => _envs ?? (_envs = new InputList<string>());
            set => _envs = value;
        }

        /// <summary>
        /// (optional) ExpectNoRefreshChanges can be set to true if a stack is not expected to have changes during a refresh before the update is run. This could occur, for example, is a resource's state is changing outside of Pulumi (e.g., metadata, timestamps).
        /// </summary>
        [Input("expectNoRefreshChanges")]
        public Input<bool>? ExpectNoRefreshChanges { get; set; }

        /// <summary>
        /// FluxSource specifies how to fetch source code from a Flux source object.
        /// </summary>
        [Input("fluxSource")]
        public Input<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecFluxSourceArgs>? FluxSource { get; set; }

        /// <summary>
        /// (optional) GitAuth allows configuring git authentication options There are 3 different authentication options: * SSH private key (and its optional password) * Personal access token * Basic auth username and password Only one authentication mode will be considered if more than one option is specified, with ssh private key/password preferred first, then personal access token, and finally basic auth credentials.
        /// </summary>
        [Input("gitAuth")]
        public Input<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecGitAuthArgs>? GitAuth { get; set; }

        /// <summary>
        /// (optional) GitAuthSecret is the the name of a Secret containing an authentication option for the git repository. There are 3 different authentication options: * Personal access token * SSH private key (and it's optional password) * Basic auth username and password Only one authentication mode will be considered if more than one option is specified, with ssh private key/password preferred first, then personal access token, and finally basic auth credentials. Deprecated. Use GitAuth instead.
        /// </summary>
        [Input("gitAuthSecret")]
        public Input<string>? GitAuthSecret { get; set; }

        [Input("prerequisites")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecPrerequisitesArgs>? _prerequisites;

        /// <summary>
        /// (optional) Prerequisites is a list of references to other stacks, each with a constraint on how long ago it must have succeeded. This can be used to make sure e.g., state is re-evaluated before running a stack that depends on it.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecPrerequisitesArgs> Prerequisites
        {
            get => _prerequisites ?? (_prerequisites = new InputList<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecPrerequisitesArgs>());
            set => _prerequisites = value;
        }

        /// <summary>
        /// ProgramRef refers to a Program object, to be used as the source for the stack.
        /// </summary>
        [Input("programRef")]
        public Input<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecProgramRefArgs>? ProgramRef { get; set; }

        /// <summary>
        /// ProjectRepo is the git source control repository from which we fetch the project code and configuration.
        /// </summary>
        [Input("projectRepo")]
        public Input<string>? ProjectRepo { get; set; }

        /// <summary>
        /// (optional) Refresh can be set to true to refresh the stack before it is updated.
        /// </summary>
        [Input("refresh")]
        public Input<bool>? Refresh { get; set; }

        /// <summary>
        /// (optional) RepoDir is the directory to work from in the project's source repository where Pulumi.yaml is located. It is used in case Pulumi.yaml is not in the project source root.
        /// </summary>
        [Input("repoDir")]
        public Input<string>? RepoDir { get; set; }

        /// <summary>
        /// (optional) ResyncFrequencySeconds when set to a non-zero value, triggers a resync of the stack at the specified frequency even if no changes to the custom resource are detected. If branch tracking is enabled (branch is non-empty), commit polling will occur at this frequency. The minimal resync frequency supported is 60 seconds. The default value for this field is 60 seconds.
        /// </summary>
        [Input("resyncFrequencySeconds")]
        public Input<int>? ResyncFrequencySeconds { get; set; }

        /// <summary>
        /// (optional) RetryOnUpdateConflict issues a stack update retry reconciliation loop in the event that the update hits a HTTP 409 conflict due to another update in progress. This is only recommended if you are sure that the stack updates are idempotent, and if you are willing to accept retry loops until all spawned retries succeed. This will also create a more populated, and randomized activity timeline for the stack in the Pulumi Service.
        /// </summary>
        [Input("retryOnUpdateConflict")]
        public Input<bool>? RetryOnUpdateConflict { get; set; }

        [Input("secrets")]
        private InputMap<string>? _secrets;

        /// <summary>
        /// (optional) Secrets is the secret configuration for this stack, which can be optionally specified inline. If this is omitted, secrets configuration is assumed to be checked in and taken from the source repository. Deprecated: use SecretRefs instead.
        /// </summary>
        public InputMap<string> Secrets
        {
            get => _secrets ?? (_secrets = new InputMap<string>());
            set => _secrets = value;
        }

        /// <summary>
        /// (optional) SecretsProvider is used to initialize a Stack with alternative encryption. Examples: - AWS:   "awskms:///arn:aws:kms:us-east-1:111122223333:key/1234abcd-12ab-34bc-56ef-1234567890ab?region=us-east-1" - Azure: "azurekeyvault://acmecorpvault.vault.azure.net/keys/mykeyname" - GCP:   "gcpkms://projects/MYPROJECT/locations/MYLOCATION/keyRings/MYKEYRING/cryptoKeys/MYKEY" - See: https://www.pulumi.com/docs/intro/concepts/secrets/#initializing-a-stack-with-alternative-encryption
        /// </summary>
        [Input("secretsProvider")]
        public Input<string>? SecretsProvider { get; set; }

        [Input("secretsRef")]
        private InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecSecretsRefArgs>? _secretsRef;

        /// <summary>
        /// (optional) SecretRefs is the secret configuration for this stack which can be specified through ResourceRef. If this is omitted, secrets configuration is assumed to be checked in and taken from the source repository.
        /// </summary>
        public InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecSecretsRefArgs> SecretsRef
        {
            get => _secretsRef ?? (_secretsRef = new InputMap<Pulumi.Kubernetes.Types.Inputs.PulumiOperator.V1Alpha1.StackSpecSecretsRefArgs>());
            set => _secretsRef = value;
        }

        /// <summary>
        /// Stack is the fully qualified name of the stack to deploy (&lt;org&gt;/&lt;stack&gt;).
        /// </summary>
        [Input("stack", required: true)]
        public Input<string> Stack { get; set; } = null!;

        [Input("targets")]
        private InputList<string>? _targets;

        /// <summary>
        /// (optional) Targets is a list of URNs of resources to update exclusively. If supplied, only resources mentioned will be updated.
        /// </summary>
        public InputList<string> Targets
        {
            get => _targets ?? (_targets = new InputList<string>());
            set => _targets = value;
        }

        /// <summary>
        /// (optional) UseLocalStackOnly can be set to true to prevent the operator from creating stacks that do not exist in the tracking git repo. The default behavior is to create a stack if it doesn't exist.
        /// </summary>
        [Input("useLocalStackOnly")]
        public Input<bool>? UseLocalStackOnly { get; set; }

        public StackSpecArgs()
        {
        }
        public static new StackSpecArgs Empty => new StackSpecArgs();
    }
}