// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1
{

    /// <summary>
    /// ResponseHeaderModifier defines a schema for a filter that modifies response headers. 
    ///  Support: Extended
    /// </summary>
    public class HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierArgs : global::Pulumi.ResourceArgs
    {
        [Input("add")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierAddArgs>? _add;

        /// <summary>
        /// Add adds the given header(s) (name, value) to the request before the action. It appends to any existing values associated with the header name. 
        ///  Input: GET /foo HTTP/1.1 my-header: foo 
        ///  Config: add: - name: "my-header" value: "bar,baz" 
        ///  Output: GET /foo HTTP/1.1 my-header: foo,bar,baz
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierAddArgs> Add
        {
            get => _add ?? (_add = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierAddArgs>());
            set => _add = value;
        }

        [Input("remove")]
        private InputList<string>? _remove;

        /// <summary>
        /// Remove the given header(s) from the HTTP request before the action. The value of Remove is a list of HTTP header names. Note that the header names are case-insensitive (see https://datatracker.ietf.org/doc/html/rfc2616#section-4.2). 
        ///  Input: GET /foo HTTP/1.1 my-header1: foo my-header2: bar my-header3: baz 
        ///  Config: remove: ["my-header1", "my-header3"] 
        ///  Output: GET /foo HTTP/1.1 my-header2: bar
        /// </summary>
        public InputList<string> Remove
        {
            get => _remove ?? (_remove = new InputList<string>());
            set => _remove = value;
        }

        [Input("set")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierSetArgs>? _set;

        /// <summary>
        /// Set overwrites the request with the given header (name, value) before the action. 
        ///  Input: GET /foo HTTP/1.1 my-header: foo 
        ///  Config: set: - name: "my-header" value: "bar" 
        ///  Output: GET /foo HTTP/1.1 my-header: bar
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierSetArgs> Set
        {
            get => _set ?? (_set = new InputList<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierSetArgs>());
            set => _set = value;
        }

        public HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierArgs()
        {
        }
        public static new HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierArgs Empty => new HTTPRouteSpecRulesBackendRefsFiltersResponseHeaderModifierArgs();
    }
}