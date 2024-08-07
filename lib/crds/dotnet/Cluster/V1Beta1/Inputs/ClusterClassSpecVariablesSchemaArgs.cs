// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1
{

    /// <summary>
    /// Schema defines the schema of the variable.
    /// </summary>
    public class ClusterClassSpecVariablesSchemaArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// OpenAPIV3Schema defines the schema of a variable via OpenAPI v3 schema. The schema is a subset of the schema used in Kubernetes CRDs.
        /// </summary>
        [Input("openAPIV3Schema", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecVariablesSchemaOpenApiv3SchemaArgs> OpenAPIV3Schema { get; set; } = null!;

        public ClusterClassSpecVariablesSchemaArgs()
        {
        }
        public static new ClusterClassSpecVariablesSchemaArgs Empty => new ClusterClassSpecVariablesSchemaArgs();
    }
}
