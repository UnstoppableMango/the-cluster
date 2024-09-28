/*
Copyright 2024 UnstoppableMango.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// RepsitoryCredentialsType describes the supported source code providers
// +kubebuilder:validation:Enum=github
type RepositoryCredentialsType string

// AppScaffold describes the supported App scaffolding
// +kubebuilder:validation:Enum=typescript;helm
type AppScaffold string

var (
	// The RepositoryCredentials authenticate with GitHub
	GitHub RepositoryCredentialsType = "github"

	// Scaffold files related to typecsript projects
	ScaffoldTypescript AppScaffold = "typescript"

	// Scaffold files related to helm charts
	ScaffoldHelm AppScaffold = "helm"
)

type RepositoryCredentials struct {
	// The type of repository credentials contained in the resource referenced by Ref
	// Valid values are:
	// - "github" (default):
	// +optional
	Type RepositoryCredentialsType `json:"type,omitempty"`

	// A reference to the Secret containing the repository credentials
	Secret corev1.SecretReference `json:"secret"`
}

// PulumiNew describes option to provide when calling `pulumi new`
type PulumiNew struct {
	// The Pulumi project Template
	// +optional
	Template string `json:"template,omitempty"`
}

// Pulumi describes options to provide when calling various `pulumi` automation commands
type Pulumi struct {
	// Options to provide when calling `pulumi` New
	// +optional
	New *PulumiNew `json:"new,omitempty"`

	// The Version of `pulumi` to use when performing operations
	// +optional
	Version string `json:"verions,omitempty"`
}

// AppSpec defines the desired state of App
type AppSpec struct {
	// Whether the operator should perform any operations related to the management of this App.
	// If disabled, the operator will immediately short-circuit
	Manage bool `json:"manage,omitempty"`

	// The URL of the git Repository to operate on
	Repository string `json:"repository,omitempty"`

	// The relative Path within the Repository to locate the App.
	// Defaults to the result of `strings.ToLower(meta.name)` appended to `app/`
	// +optional
	Path string `json:"path,omitempty"`

	// The Credentials to authenticate with the Repository
	Credentials RepositoryCredentials `json:"credentials"`

	// The scaffolding to perform when initializing the App.
	// This cannot be modified after the App has been Initialized.
	// Valid values are:
	// - "typescript" (default): Perform scaffolding for typescript such as `pulumi new typescript`
	// - "helm": Create an empty helm chart in the App Path
	Scaffold []AppScaffold `json:"scaffold,omitempty"`

	// Pulumi describes explicit overrides to use when running `pulumi` commands.
	// The defaults for any command are determined by the AppScaffolds specified in Scaffold
	// +optional
	Pulumi *Pulumi `json:"pulumi,omitempty"`
}

// AppStatus defines the observed state of App
type AppStatus struct {
	// Whether the Pulumi project has been Initialized
	Initialized bool `json:"initialized,omitempty"`

	// The scaffolding performed when initializing the App
	Scaffolds []AppScaffold `json:"scaffold"`

	// Whether the operator is currently managing the App
	Managed bool `json:"managed"`

	// Any Jobs managed by the operator
	// +optional
	Jobs []corev1.ObjectReference `json:"jobs,omitempty"`

	// The LastErrorMessage reported by a Job.
	// A successful Job will clear this value.
	// +optional
	LastErrorMessage *string `json:"lastErrorMessage,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// App is the Schema for the apps API
type App struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   AppSpec   `json:"spec,omitempty"`
	Status AppStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// AppList contains a list of App
type AppList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []App `json:"items"`
}

func init() {
	SchemeBuilder.Register(&App{}, &AppList{})
}
