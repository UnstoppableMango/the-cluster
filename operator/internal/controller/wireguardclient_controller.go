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

package controller

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/utils/ptr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"

	corev1alpha1 "github.com/unstoppablemango/the-cluster/operator/api/v1alpha1"
)

var (
	TypeAvailableWireguardClient = "Available"
	TypeDegradedWireguardClient  = "Degraded"
	WireguardClientFinalizer     = "wireguardclient.core.thecluster.io/finalizer"
)

// WireguardClientReconciler reconciles a WireguardClient object
type WireguardClientReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=core.thecluster.io,resources=wireguardclients,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core.thecluster.io,resources=wireguardclients/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=core.thecluster.io,resources=wireguardclients/finalizers,verbs=update

func (r *WireguardClientReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	wg := &corev1alpha1.WireguardClient{}
	if err := r.Get(ctx, req.NamespacedName, wg); err != nil {
		log.Info("reading wireguard client resource", "err", err)
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	if len(wg.Status.Conditions) == 0 {
		_ = meta.SetStatusCondition(
			&wg.Status.Conditions,
			metav1.Condition{
				Type:    TypeAvailableWireguardClient,
				Status:  metav1.ConditionUnknown,
				Reason:  "Reconciling",
				Message: "Starting reconciliation",
			},
		)
		if err := r.Status().Update(ctx, wg); err != nil {
			log.Error(err, "Failed to update wireguard client status")
			return ctrl.Result{}, err
		}
		if err := r.Get(ctx, req.NamespacedName, wg); err != nil {
			log.Error(err, "Failed to re-fetch wireguard client")
			return ctrl.Result{}, err
		}
	}

	if !controllerutil.ContainsFinalizer(wg, WireguardClientFinalizer) {
		log.Info("Adding finalizer for WireguardClient")
		if ok := controllerutil.AddFinalizer(wg, WireguardClientFinalizer); !ok {
			err := fmt.Errorf("finalizer was not added")
			log.Error(err, "Failed to add finalizer")
			return ctrl.Result{}, err
		}
		if err := r.Update(ctx, wg); err != nil {
			log.Error(err, "Failed to update WireguardClient with finalizer")
			return ctrl.Result{}, err
		}
	}

	if wg.GetDeletionTimestamp() != nil {
		if controllerutil.ContainsFinalizer(wg, WireguardClientFinalizer) {
			log.Info("Performing finalizer operations before deleting resource")
			_ = meta.SetStatusCondition(
				&wg.Status.Conditions,
				metav1.Condition{
					Type:    TypeDegradedWireguardClient,
					Status:  metav1.ConditionUnknown,
					Reason:  "Finalizing",
					Message: fmt.Sprintf("Performing finalizer operations for %s", wg.Name),
				},
			)
			if err := r.Status().Update(ctx, wg); err != nil {
				log.Error(err, "Failed to update wireguard client status")
				return ctrl.Result{}, nil
			}

			if err := r.FinalizerOperations(ctx, wg); err != nil {
				log.Error(err, "Failed to perform finalizer operations")
				return ctrl.Result{Requeue: true}, err
			}

			if err := r.Get(ctx, req.NamespacedName, wg); err != nil {
				log.Error(err, "Failed to re-fetch wireguard client")
				return ctrl.Result{}, err
			}

			_ = meta.SetStatusCondition(
				&wg.Status.Conditions,
				metav1.Condition{
					Type:    TypeDegradedWireguardClient,
					Status:  metav1.ConditionTrue,
					Reason:  "Finalizing",
					Message: fmt.Sprintf("Finalizer operations for %s completed successfully", wg.Name),
				},
			)
			if err := r.Status().Update(ctx, wg); err != nil {
				log.Error(err, "Failed to update wireguard client status")
				return ctrl.Result{}, err
			}

			log.Info("Removing finalizer")
			if ok := controllerutil.RemoveFinalizer(wg, WireguardClientFinalizer); !ok {
				err := fmt.Errorf("finalizer for wireguard client was not removed")
				log.Error(err, "Failed to remove finalizer")
				return ctrl.Result{}, err
			}
			if err := r.Update(ctx, wg); err != nil {
				log.Error(err, "Failed to remove finalizer")
				return ctrl.Result{}, err
			}
		}

		return ctrl.Result{}, nil
	}

	deployment := &appsv1.Deployment{}
	if err := r.Client.Get(ctx, req.NamespacedName, deployment); errors.IsNotFound(err) {
		log.Info("Creating a new deployment", "ns", req.Namespace, "name", req.Name)
		if err := r.CreateDeployment(ctx, wg); err != nil {
			log.Error(err, "Failed to create deployment for wireguard client")
			_ = meta.SetStatusCondition(
				&wg.Status.Conditions,
				metav1.Condition{
					Type:    TypeAvailableWireguardClient,
					Status:  metav1.ConditionFalse,
					Reason:  "Reconciling",
					Message: fmt.Sprintf("Failed to create deployment for %s: %s", wg.Name, err),
				},
			)
			if err = r.Status().Update(ctx, wg); err != nil {
				log.Error(err, "Failed to update status")
				return ctrl.Result{}, err
			}

			return ctrl.Result{RequeueAfter: time.Minute}, err
		}
	} else if err != nil {
		log.Error(err, "Failed to get deployment")
		return ctrl.Result{}, err
	}

	meta.SetStatusCondition(
		&wg.Status.Conditions,
		metav1.Condition{
			Type:    TypeAvailableWireguardClient,
			Status:  metav1.ConditionTrue,
			Reason:  "Reconciling",
			Message: fmt.Sprintf("Deployment for %s created successfully", wg.Name),
		},
	)
	if err := r.Status().Update(ctx, wg); err != nil {
		log.Error(err, "Failed to update status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *WireguardClientReconciler) CreateDeployment(ctx context.Context, wg *corev1alpha1.WireguardClient) error {
	volumes := []corev1.Volume{}
	for _, c := range wg.Spec.Configs {
		if v, err := r.Volume(ctx, c); err != nil {
			return err
		} else {
			volumes = append(volumes, v)
		}
	}

	mounts := []corev1.VolumeMount{}
	for _, v := range volumes {
		mounts = append(mounts, corev1.VolumeMount{
			Name:      v.Name,
			MountPath: "/config",
		})
	}

	env := []corev1.EnvVar{
		{Name: "PUID", Value: strconv.FormatInt(wg.Spec.PUID, 10)},
		{Name: "PGID", Value: strconv.FormatInt(wg.Spec.PGID, 10)},
		{Name: "TZ", Value: wg.Spec.TZ},
	}

	if len(wg.Spec.AllowedIPs) > 0 {
		env = append(env, corev1.EnvVar{
			Name:  "ALLOWEDIPS",
			Value: strings.Join(wg.Spec.AllowedIPs, ","),
		})
	}
	if wg.Spec.LogConfs != nil {
		env = append(env, corev1.EnvVar{
			Name:  "LOG_CONFS",
			Value: strconv.FormatBool(*wg.Spec.LogConfs),
		})
	}

	labels := map[string]string{
		"app.kubernetes.io/name":       "wireguard",
		"app.kubernetes.io/version":    "latest",
		"app.kubernetes.io/managed-by": "WireguardClientController",
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      wg.GetName(),
			Namespace: wg.GetNamespace(),
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: ptr.To[int32](1),
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "wireguard",
						Image: "lscr.io/linuxserver/wireguard:latest",
						Env:   env,
						Ports: []corev1.ContainerPort{{
							ContainerPort: 51820,
							Protocol:      corev1.ProtocolUDP,
						}},
						VolumeMounts: mounts,
						// TODO: Resources
						SecurityContext: &corev1.SecurityContext{
							Capabilities: &corev1.Capabilities{
								Add: []corev1.Capability{
									"NET_ADMIN",
								},
							},
							RunAsUser:                &wg.Spec.PUID,
							RunAsGroup:               &wg.Spec.PGID,
							RunAsNonRoot:             ptr.To(true),
							AllowPrivilegeEscalation: ptr.To(false),
							ReadOnlyRootFilesystem:   wg.Spec.ReadOnly,
						},
					}},
					Volumes: volumes,
					SecurityContext: &corev1.PodSecurityContext{
						RunAsNonRoot: ptr.To(true),
						SeccompProfile: &corev1.SeccompProfile{
							Type: corev1.SeccompProfileTypeRuntimeDefault,
						},
					},
				},
			},
		},
	}

	if err := ctrl.SetControllerReference(wg, deployment, r.Scheme); err != nil {
		return err
	}

	return r.Create(ctx, deployment)
}

func (r *WireguardClientReconciler) Volume(ctx context.Context, c corev1alpha1.WireguardClientConfig) (corev1.Volume, error) {
	if c.ValueFrom.SecretKeyRef != nil {
		secret := c.ValueFrom.SecretKeyRef
		return corev1.Volume{
			Name: secret.Name,
			VolumeSource: corev1.VolumeSource{
				Secret: &corev1.SecretVolumeSource{
					SecretName: secret.Name,
					Items: []corev1.KeyToPath{{
						Key: secret.Key,
					}},
				},
			},
		}, nil
	}

	if c.ValueFrom.ConfigMapRef != nil {
		cm := c.ValueFrom.ConfigMapRef
		return corev1.Volume{
			Name: cm.Name,
			VolumeSource: corev1.VolumeSource{
				ConfigMap: &corev1.ConfigMapVolumeSource{
					LocalObjectReference: cm.LocalObjectReference,
					Items: []corev1.KeyToPath{{
						Key: cm.Key,
					}},
				},
			},
		}, nil
	}

	return corev1.Volume{}, fmt.Errorf("invalid wireguard client config")
}

func (r *WireguardClientReconciler) FinalizerOperations(ctx context.Context, wg *corev1alpha1.WireguardClient) error {
	// TODO: Cleanup

	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *WireguardClientReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1alpha1.WireguardClient{}).
		Owns(&appsv1.Deployment{}).
		Complete(r)
}
