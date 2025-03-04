// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1
{

    /// <summary>
    /// OpenAPIV3Schema defines the schema of a variable via OpenAPI v3 schema. The schema is a subset of the schema used in Kubernetes CRDs.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassStatusVariablesDefinitionsSchemaOpenApiv3Schema
    {
        /// <summary>
        /// AdditionalProperties specifies the schema of values in a map (keys are always strings). NOTE: Can only be set if type is object. NOTE: AdditionalProperties is mutually exclusive with Properties. NOTE: This field uses PreserveUnknownFields and Schemaless, because recursive validation is not possible.
        /// </summary>
        public readonly ImmutableDictionary<string, object> AdditionalProperties;
        /// <summary>
        /// Description is a human-readable description of this variable.
        /// </summary>
        public readonly string Description;
        /// <summary>
        /// Enum is the list of valid values of the variable. NOTE: Can be set for all types.
        /// </summary>
        public readonly ImmutableArray<ImmutableDictionary<string, object>> Enum;
        /// <summary>
        /// Example is an example for this variable.
        /// </summary>
        public readonly ImmutableDictionary<string, object> Example;
        /// <summary>
        /// ExclusiveMaximum specifies if the Maximum is exclusive. NOTE: Can only be set if type is integer or number.
        /// </summary>
        public readonly bool ExclusiveMaximum;
        /// <summary>
        /// ExclusiveMinimum specifies if the Minimum is exclusive. NOTE: Can only be set if type is integer or number.
        /// </summary>
        public readonly bool ExclusiveMinimum;
        /// <summary>
        /// Format is an OpenAPI v3 format string. Unknown formats are ignored. For a list of supported formats please see: (of the k8s.io/apiextensions-apiserver version we're currently using) https://github.com/kubernetes/apiextensions-apiserver/blob/master/pkg/apiserver/validation/formats.go NOTE: Can only be set if type is string.
        /// </summary>
        public readonly string Format;
        /// <summary>
        /// Items specifies fields of an array. NOTE: Can only be set if type is array. NOTE: This field uses PreserveUnknownFields and Schemaless, because recursive validation is not possible.
        /// </summary>
        public readonly ImmutableDictionary<string, object> Items;
        /// <summary>
        /// MaxItems is the max length of an array variable. NOTE: Can only be set if type is array.
        /// </summary>
        public readonly int MaxItems;
        /// <summary>
        /// MaxLength is the max length of a string variable. NOTE: Can only be set if type is string.
        /// </summary>
        public readonly int MaxLength;
        /// <summary>
        /// Maximum is the maximum of an integer or number variable. If ExclusiveMaximum is false, the variable is valid if it is lower than, or equal to, the value of Maximum. If ExclusiveMaximum is true, the variable is valid if it is strictly lower than the value of Maximum. NOTE: Can only be set if type is integer or number.
        /// </summary>
        public readonly int Maximum;
        /// <summary>
        /// MinItems is the min length of an array variable. NOTE: Can only be set if type is array.
        /// </summary>
        public readonly int MinItems;
        /// <summary>
        /// MinLength is the min length of a string variable. NOTE: Can only be set if type is string.
        /// </summary>
        public readonly int MinLength;
        /// <summary>
        /// Minimum is the minimum of an integer or number variable. If ExclusiveMinimum is false, the variable is valid if it is greater than, or equal to, the value of Minimum. If ExclusiveMinimum is true, the variable is valid if it is strictly greater than the value of Minimum. NOTE: Can only be set if type is integer or number.
        /// </summary>
        public readonly int Minimum;
        /// <summary>
        /// Pattern is the regex which a string variable must match. NOTE: Can only be set if type is string.
        /// </summary>
        public readonly string Pattern;
        /// <summary>
        /// Properties specifies fields of an object. NOTE: Can only be set if type is object. NOTE: Properties is mutually exclusive with AdditionalProperties. NOTE: This field uses PreserveUnknownFields and Schemaless, because recursive validation is not possible.
        /// </summary>
        public readonly ImmutableDictionary<string, object> Properties;
        /// <summary>
        /// Required specifies which fields of an object are required. NOTE: Can only be set if type is object.
        /// </summary>
        public readonly ImmutableArray<string> Required;
        /// <summary>
        /// Type is the type of the variable. Valid values are: object, array, string, integer, number or boolean.
        /// </summary>
        public readonly string Type;
        /// <summary>
        /// UniqueItems specifies if items in an array must be unique. NOTE: Can only be set if type is array.
        /// </summary>
        public readonly bool UniqueItems;
        /// <summary>
        /// XPreserveUnknownFields allows setting fields in a variable object which are not defined in the variable schema. This affects fields recursively, except if nested properties or additionalProperties are specified in the schema.
        /// </summary>
        public readonly bool X-kubernetes-preserve-unknown-fields;

        [OutputConstructor]
        private ClusterClassStatusVariablesDefinitionsSchemaOpenApiv3Schema(
            ImmutableDictionary<string, object> additionalProperties,

            string description,

            ImmutableArray<ImmutableDictionary<string, object>> @enum,

            ImmutableDictionary<string, object> example,

            bool exclusiveMaximum,

            bool exclusiveMinimum,

            string format,

            ImmutableDictionary<string, object> items,

            int maxItems,

            int maxLength,

            int maximum,

            int minItems,

            int minLength,

            int minimum,

            string pattern,

            ImmutableDictionary<string, object> properties,

            ImmutableArray<string> required,

            string type,

            bool uniqueItems,

            bool x-kubernetes-preserve-unknown-fields)
        {
            AdditionalProperties = additionalProperties;
            Description = description;
            Enum = @enum;
            Example = example;
            ExclusiveMaximum = exclusiveMaximum;
            ExclusiveMinimum = exclusiveMinimum;
            Format = format;
            Items = items;
            MaxItems = maxItems;
            MaxLength = maxLength;
            Maximum = maximum;
            MinItems = minItems;
            MinLength = minLength;
            Minimum = minimum;
            Pattern = pattern;
            Properties = properties;
            Required = required;
            Type = type;
            UniqueItems = uniqueItems;
            X-kubernetes-preserve-unknown-fields = x-kubernetes-preserve-unknown-fields;
        }
    }
}
