// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.K8s.V1
{

    /// <summary>
    /// Route defines a route.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerRouteSpecSubroutes
    {
        /// <summary>
        /// Action defines an action.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesAction Action;
        public readonly string Dos;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesErrorPages> ErrorPages;
        public readonly string LocationSnippets;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesMatches> Matches;
        public readonly string Path;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesPolicies> Policies;
        public readonly string Route;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesSplits> Splits;

        [OutputConstructor]
        private VirtualServerRouteSpecSubroutes(
            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesAction action,

            string dos,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesErrorPages> errorPages,

            string locationSnippets,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesMatches> matches,

            string path,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesPolicies> policies,

            string route,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesSplits> splits)
        {
            Action = action;
            Dos = dos;
            ErrorPages = errorPages;
            LocationSnippets = locationSnippets;
            Matches = matches;
            Path = path;
            Policies = policies;
            Route = route;
            Splits = splits;
        }
    }
}