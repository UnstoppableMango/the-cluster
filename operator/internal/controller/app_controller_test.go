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

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	corev1alpha1 "github.com/unstoppablemango/the-cluster/operator/api/v1alpha1"
	"github.com/unstoppablemango/the-cluster/operator/internal/util"
)

var _ = Describe("App Controller", func() {
	Context("When reconciling a resource", func() {
		const resourceName = "test-resource"

		ctx := context.Background()

		typeNamespacedName := types.NamespacedName{
			Name:      resourceName,
			Namespace: "default", // TODO(user):Modify as needed
		}
		app := &corev1alpha1.App{}

		BeforeEach(func() {
			By("creating the custom resource for the Kind App")
			err := k8sClient.Get(ctx, typeNamespacedName, app)
			if err != nil && errors.IsNotFound(err) {
				resource := &corev1alpha1.App{
					ObjectMeta: metav1.ObjectMeta{
						Name:      resourceName,
						Namespace: "default",
					},
					Spec: corev1alpha1.AppSpec{},
				}
				Expect(k8sClient.Create(ctx, resource)).To(Succeed())
			}
		})

		AfterEach(func() {
			resource := &corev1alpha1.App{}
			err := k8sClient.Get(ctx, typeNamespacedName, resource)
			Expect(err).NotTo(HaveOccurred())

			By("Cleanup the specific resource instance App")
			Expect(k8sClient.Delete(ctx, resource)).To(Succeed())
		})

		It("should successfully reconcile the resource", func() {
			By("Reconciling the created resource")
			controllerReconciler := &AppReconciler{
				Client: k8sClient,
				Scheme: k8sClient.Scheme(),
			}

			_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
				NamespacedName: typeNamespacedName,
			})

			Expect(err).NotTo(HaveOccurred())
			err = k8sClient.Get(ctx, typeNamespacedName, app)
			Expect(err).NotTo(HaveOccurred())
			Expect(app.Status.Managed).To(BeTrueBecause("by default the operator manages the App"))
			Expect(app.Status.Scaffolds).To(ContainElement(corev1alpha1.ScaffoldTypescript))
			Expect(app.Status.Conditions).To(HaveLen(1))
			initialized := app.Status.Conditions[0]
			Expect(initialized.Type).To(Equal(corev1alpha1.AppInitialized))
			Expect(initialized.Status).To(Equal(metav1.ConditionFalse))
			Expect(initialized.Reason).To(Equal("Fresh"))
		})

		Context("And the App is explicitly managed", func() {
			BeforeEach(func() {
				resource := &corev1alpha1.App{}
				err := k8sClient.Get(ctx, typeNamespacedName, resource)
				Expect(err).NotTo(HaveOccurred())

				resource.Spec.Manage = util.BoolPtr(true)
				err = k8sClient.Update(ctx, resource)
				Expect(err).NotTo(HaveOccurred())
			})

			It("should successfully reconcile the resource", func() {
				controllerReconciler := &AppReconciler{
					Client: k8sClient,
					Scheme: k8sClient.Scheme(),
				}

				By("Reconciling the created resource")
				_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				Expect(app.Status.Managed).To(BeTrueBecause("management is enabled"))
				Expect(app.Status.Scaffolds).To(ContainElement(corev1alpha1.ScaffoldTypescript))
				Expect(app.Status.Conditions).To(HaveLen(1))
				initialized := app.Status.Conditions[0]
				Expect(initialized.Type).To(Equal(corev1alpha1.AppInitialized))
				Expect(initialized.Status).To(Equal(metav1.ConditionFalse))
				Expect(initialized.Reason).To(Equal("Fresh"))
			})
		})

		Context("And the App is not managed", func() {
			BeforeEach(func() {
				resource := &corev1alpha1.App{}
				err := k8sClient.Get(ctx, typeNamespacedName, resource)
				Expect(err).NotTo(HaveOccurred())

				resource.Spec.Manage = util.BoolPtr(false)
				err = k8sClient.Update(ctx, resource)
				Expect(err).NotTo(HaveOccurred())
			})

			It("should successfully reconcile the resource", func() {
				controllerReconciler := &AppReconciler{
					Client: k8sClient,
					Scheme: k8sClient.Scheme(),
				}

				By("Reconciling the created resource")
				_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				Expect(app.Status.Managed).To(BeFalseBecause("management is disabled"))
				Expect(app.Status.Scaffolds).To(BeEmpty())
				Expect(app.Status.Conditions).To(HaveLen(1))
				initialized := app.Status.Conditions[0]
				Expect(initialized.Type).To(Equal(corev1alpha1.AppInitialized))
				Expect(initialized.Status).To(Equal(metav1.ConditionFalse))
				Expect(initialized.Reason).To(Equal("UnManaged"))
			})

			It("should ignore changes to Scaffolds", func() {
				resource := &corev1alpha1.App{}
				err := k8sClient.Get(ctx, typeNamespacedName, resource)
				Expect(err).NotTo(HaveOccurred())

				resource.Spec.Scaffold = []corev1alpha1.AppScaffold{
					corev1alpha1.ScaffoldTypescript,
				}
				err = k8sClient.Update(ctx, resource)
				Expect(err).NotTo(HaveOccurred())

				controllerReconciler := &AppReconciler{
					Client: k8sClient,
					Scheme: k8sClient.Scheme(),
				}

				By("Reconciling the created resource")
				_, err = controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				Expect(app.Status.Scaffolds).To(BeEmpty())
				// Sanity check
				Expect(app.Spec.Scaffold).To(ContainElement(corev1alpha1.ScaffoldTypescript))
			})
		})

		Context("And a scaffold is specified", func() {
			BeforeEach(func() {
				resource := &corev1alpha1.App{}
				err := k8sClient.Get(ctx, typeNamespacedName, resource)
				Expect(err).NotTo(HaveOccurred())

				By("Setting the App Scaffolds to helm")
				resource.Spec.Scaffold = []corev1alpha1.AppScaffold{
					corev1alpha1.ScaffoldHelm,
				}
				err = k8sClient.Update(ctx, resource)
				Expect(err).NotTo(HaveOccurred())
			})

			It("should successfully reconcile the resource", func() {
				By("Reconciling the created resource")
				controllerReconciler := &AppReconciler{
					Client: k8sClient,
					Scheme: k8sClient.Scheme(),
				}

				_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				Expect(app.Status.Managed).To(BeTrueBecause("by default the operator manages the App"))
				Expect(app.Status.Scaffolds).To(ContainElement(corev1alpha1.ScaffoldHelm))
				Expect(app.Status.Conditions).To(HaveLen(1))
				initialized := app.Status.Conditions[0]
				Expect(initialized.Type).To(Equal(corev1alpha1.AppInitialized))
				Expect(initialized.Status).To(Equal(metav1.ConditionFalse))
				Expect(initialized.Reason).To(Equal("Fresh"))
			})

			It("should ignore changes to Scaffold", func() {
				By("Reconciling the created resource")
				controllerReconciler := &AppReconciler{
					Client: k8sClient,
					Scheme: k8sClient.Scheme(),
				}

				_, err := controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				// Sanity check
				Expect(app.Status.Scaffolds).To(ContainElement(corev1alpha1.ScaffoldHelm))
				Expect(app.Spec.Scaffold).To(ContainElement(corev1alpha1.ScaffoldHelm))

				By("Updating the App Scaffolds to typescript")
				resource := &corev1alpha1.App{}
				err = k8sClient.Get(ctx, typeNamespacedName, resource)
				Expect(err).NotTo(HaveOccurred())

				resource.Spec.Scaffold = []corev1alpha1.AppScaffold{
					corev1alpha1.ScaffoldTypescript,
				}
				err = k8sClient.Update(ctx, resource)
				Expect(err).NotTo(HaveOccurred())

				By("Reconciling the updated resource")
				_, err = controllerReconciler.Reconcile(ctx, reconcile.Request{
					NamespacedName: typeNamespacedName,
				})

				Expect(err).NotTo(HaveOccurred())
				err = k8sClient.Get(ctx, typeNamespacedName, app)
				Expect(err).NotTo(HaveOccurred())
				Expect(app.Status.Scaffolds).To(ContainElement(corev1alpha1.ScaffoldHelm))
				// Sanity check
				Expect(app.Spec.Scaffold).To(ContainElement(corev1alpha1.ScaffoldTypescript))
			})
		})
	})
})
