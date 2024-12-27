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

type WireguardClientConfigSource struct {
	ConfigMapRef *corev1.ConfigMapKeySelector `json:"configMapRef,omitempty"`
	SecretKeyRef *corev1.SecretKeySelector    `json:"secretKeyRef,omitempty"`
}

type WireguardClientConfig struct {
	ValueFrom *WireguardClientConfigSource `json:"valueFrom,omitempty"`
}

// WireguardClientSpec defines the desired state of WireguardClient
type WireguardClientSpec struct {
	// For UserID, see the [linuxserver explanation]
	//
	// [linuxserver explanation]: https://github.com/linuxserver/docker-wireguard#user--group-identifiers
	PUID int64 `json:"puid"`

	// For GroupID, see the [linuxserver explanation]
	//
	// [linuxserver explanation]: https://github.com/linuxserver/docker-wireguard#user--group-identifiers
	PGID int64 `json:"pgid"`

	// TZ specifies a timezone to use, see this [list of time zones]
	//
	// [list of time zones]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
	TZ string `json:"tz"`

	// The IPs/Ranges that the peers will be able to reach using the VPN connection.
	// If not specified the default value is: '0.0.0.0/0, ::0/0'
	// This will cause ALL traffic to route through the VPN, if you want split tunneling,
	// set this to only the IPs you would like to use the tunnel AND the ip of the server's WG ip, such as 10.13.13.1.
	// +optional
	AllowedIPs []string `json:"allowedIps,omitempty"`

	// Generated QR codes will be displayed in the docker log.
	// Set to false to skip log output.
	// +optional
	LogConfs *bool `json:"logConfs,omitempty"`

	// Run container with a read-only filesystem. More info in the linuxserver.io [docs]
	//
	// [docs]: https://docs.linuxserver.io/misc/read-only/
	//
	// +optional
	ReadOnly *bool `json:"readonly,omitempty"`

	// Wireguard client configurations to mount in the container
	Configs []WireguardClientConfig `json:"configs"`
}

// WireguardClientStatus defines the observed state of WireguardClient
type WireguardClientStatus struct {
	Conditions []metav1.Condition `json:"conditions,omitempty" patchStrategy:"merge" patchMergeKey:"type" protobuf:"bytes,1,rep,name=conditions"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// WireguardClient is the Schema for the wireguardclients API
type WireguardClient struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   WireguardClientSpec   `json:"spec,omitempty"`
	Status WireguardClientStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// WireguardClientList contains a list of WireguardClient
type WireguardClientList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []WireguardClient `json:"items"`
}

func init() {
	SchemeBuilder.Register(&WireguardClient{}, &WireguardClientList{})
}
