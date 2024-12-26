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
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	appsv1 "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	corev1alpha1 "github.com/unstoppablemango/the-cluster/operator/api/v1alpha1"
)

var _ = Describe("WireguardClient Controller", func() {
	const (
		timeout  = time.Second * 10
		duration = time.Second * 10
		interval = time.Millisecond * 250
	)

	Context("When reconciling a resource", func() {
		const resourceName = "test-resource"

		ctx := context.Background()

		typeNamespacedName := types.NamespacedName{
			Name:      resourceName,
			Namespace: "default",
		}
		wireguardclient := &corev1alpha1.WireguardClient{}

		BeforeEach(func() {
			By("creating the custom resource for the Kind WireguardClient")
			err := k8sClient.Get(ctx, typeNamespacedName, wireguardclient)
			if err != nil && errors.IsNotFound(err) {
				resource := &corev1alpha1.WireguardClient{
					ObjectMeta: metav1.ObjectMeta{
						Name:      resourceName,
						Namespace: "default",
					},
					Spec: corev1alpha1.WireguardClientSpec{},
				}
				Expect(k8sClient.Create(ctx, resource)).To(Succeed())
			}
		})

		AfterEach(func() {
			resource := &corev1alpha1.WireguardClient{}
			err := k8sClient.Get(ctx, typeNamespacedName, resource)
			Expect(err).NotTo(HaveOccurred())

			By("Cleanup the specific resource instance WireguardClient")
			Expect(k8sClient.Delete(ctx, resource)).To(Succeed())

			By("Removing any dangling deployments")
			deployment := &appsv1.Deployment{}
			err = k8sClient.Get(ctx, typeNamespacedName, deployment)
			Expect(client.IgnoreNotFound(err)).NotTo(HaveOccurred())
		})

		It("should successfully reconcile the resource", func() {
			By("Reconciling the created resource")
			controllerReconciler := &WireguardClientReconciler{
				Client: k8sClient,
				Scheme: k8sClient.Scheme(),
			}

			_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
				NamespacedName: typeNamespacedName,
			})
			Expect(err).NotTo(HaveOccurred())

			deployment := &appsv1.Deployment{}
			Eventually(func(g Gomega) {
				g.Expect(k8sClient.Get(ctx, typeNamespacedName, deployment)).To(Succeed())
				if len(deployment.Status.Conditions) > 0 {
					GinkgoWriter.Println(deployment.Status.Conditions[0].Message)
				}
				g.Expect(deployment.Status.ReadyReplicas).To(Equal(1))
			}, duration, interval).Should(Succeed())
		})
	})
})
