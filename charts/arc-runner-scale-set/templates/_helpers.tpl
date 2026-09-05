{{/*
Namespace for a scale set, derived from its name.

Every scale set registers under the same GitHub name (.Values.runnerScaleSetName),
and the upstream chart derives the AutoscalingRunnerSet object name from that
value, so each one needs a namespace of its own to avoid colliding. Repo names
carry characters a namespace cannot (`thecluster.io`, `thecluster.lan`,
`unstoppablemango.io`), hence the substitutions.
*/}}
{{- define "arc-runner-scale-set.namespace" -}}
{{- printf "arc-%s" (. | lower | replace "." "-" | replace "_" "-") | trunc 63 | trimSuffix "-" -}}
{{- end }}
