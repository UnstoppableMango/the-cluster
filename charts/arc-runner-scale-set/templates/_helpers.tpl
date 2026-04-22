{{/*
Stable resource name prefix for a scale set.
Args: dict with keys "name" (scale set name) and "release" ($.Release)
*/}}
{{- define "arc-runner-scale-set.fullname" -}}
{{- printf "%s-gha-rs" .name | trunc 63 | trimSuffix "-" | replace "_" "-" }}
{{- end }}

{{/*
No-permission service account name for a scale set.
*/}}
{{- define "arc-runner-scale-set.noPermissionSAName" -}}
{{- printf "%s-no-permission" (include "arc-runner-scale-set.fullname" .) | replace "_" "-" }}
{{- end }}

{{/*
Manager role/rolebinding name for a scale set.
*/}}
{{- define "arc-runner-scale-set.managerRoleName" -}}
{{- printf "%s-manager" (include "arc-runner-scale-set.fullname" .) }}
{{- end }}

{{/*
Kube-mode service account name for a scale set.
*/}}
{{- define "arc-runner-scale-set.kubeModeServiceAccountName" -}}
{{- printf "%s-kube-mode" (include "arc-runner-scale-set.fullname" .) | replace "_" "-" }}
{{- end }}

{{/*
Kube-mode role/rolebinding name.
*/}}
{{- define "arc-runner-scale-set.kubeModeRoleName" -}}
{{- printf "%s-kube-mode" (include "arc-runner-scale-set.fullname" .) }}
{{- end }}

{{/*
Common labels for a scale set resource.
Args: dict with keys "name", "release", "chart"
*/}}
{{- define "arc-runner-scale-set.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .chart.Name .chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .name }}
app.kubernetes.io/managed-by: {{ .release.Service }}
app.kubernetes.io/part-of: gha-rs
actions.github.com/scale-set-name: {{ .name }}
actions.github.com/scale-set-namespace: {{ .namespace }}
{{- end }}

{{/*
Resolve the controller service account name. Uses explicit config or cluster discovery.
Args: dict with keys "ss" (merged scale set values), "release", "namespace"
*/}}
{{- define "arc-runner-scale-set.controllerSAName" -}}
{{- if and .ss.controllerServiceAccount .ss.controllerServiceAccount.name }}
{{- .ss.controllerServiceAccount.name }}
{{- else }}
  {{- $found := 0 }}
  {{- $name := "" }}
  {{- range $index, $dep := (lookup "apps/v1" "Deployment" "" "").items }}
    {{- if kindIs "map" $dep.metadata.labels }}
      {{- if eq (get $dep.metadata.labels "app.kubernetes.io/part-of") "gha-rs-controller" }}
        {{- if eq $found 0 }}
          {{- $found = 1 }}
          {{- $name = get $dep.metadata.labels "actions.github.com/controller-service-account-name" }}
        {{- end }}
      {{- end }}
    {{- end }}
  {{- end }}
  {{- if eq $found 0 }}
    {{- fail "No gha-rs-controller deployment found. Set controllerServiceAccount.name in defaults or per scale set." }}
  {{- end }}
{{- $name }}
{{- end }}
{{- end }}

{{/*
Resolve the controller service account namespace.
*/}}
{{- define "arc-runner-scale-set.controllerSANamespace" -}}
{{- if and .ss.controllerServiceAccount .ss.controllerServiceAccount.namespace }}
{{- .ss.controllerServiceAccount.namespace }}
{{- else }}
  {{- $found := 0 }}
  {{- $ns := "" }}
  {{- range $index, $dep := (lookup "apps/v1" "Deployment" "" "").items }}
    {{- if kindIs "map" $dep.metadata.labels }}
      {{- if eq (get $dep.metadata.labels "app.kubernetes.io/part-of") "gha-rs-controller" }}
        {{- if eq $found 0 }}
          {{- $found = 1 }}
          {{- $ns = get $dep.metadata.labels "actions.github.com/controller-service-account-namespace" }}
        {{- end }}
      {{- end }}
    {{- end }}
  {{- end }}
  {{- if eq $found 0 }}
    {{- fail "No gha-rs-controller deployment found. Set controllerServiceAccount.namespace in defaults or per scale set." }}
  {{- end }}
{{- $ns }}
{{- end }}
{{- end }}

{{/*
Render the dind init container image from runner container list.
*/}}
{{- define "arc-runner-scale-set.dindInitImage" -}}
{{- range .ss.template.spec.containers }}
{{- if eq .name "runner" }}{{ .image }}{{- end }}
{{- end }}
{{- end }}
