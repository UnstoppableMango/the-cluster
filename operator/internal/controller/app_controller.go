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
	"slices"

	batchv1 "k8s.io/api/batch/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ref "k8s.io/client-go/tools/reference"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	"github.com/unstoppablemango/the-cluster/operator/api/v1alpha1"
	corev1alpha1 "github.com/unstoppablemango/the-cluster/operator/api/v1alpha1"
)

// AppReconciler reconciles a App object
type AppReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=core.thecluster.io,resources=apps,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core.thecluster.io,resources=apps/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=core.thecluster.io,resources=apps/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the App object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.19.0/pkg/reconcile
func (r *AppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	var app corev1alpha1.App
	if err := r.Get(ctx, req.NamespacedName, &app); err != nil {
		log.Error(err, "unable to fetch App")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	if app.Spec.Manage != nil {
		app.Status.Managed = *app.Spec.Manage
	} else {
		app.Status.Managed = true
	}

	if app.Status.Scaffolds == nil {
		app.Status.Scaffolds = []v1alpha1.AppScaffold{}
	}

	if !app.Status.Managed {
		err := r.Status().Update(ctx, &app)
		if err != nil {
			log.Error(err, "unable to update app status")
		}
		return ctrl.Result{}, err
	}

	// if err := r.refreshJobs(ctx, req, &app); err != nil {
	// 	log.Error(err, "unable to refresh jobs")
	// 	return ctrl.Result{}, err
	// }

	if err := r.Status().Update(ctx, &app); err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *AppReconciler) refreshJobs(ctx context.Context, req ctrl.Request, app *corev1alpha1.App) error {
	log := log.FromContext(ctx)

	var jobs batchv1.JobList
	err := r.List(ctx, &jobs,
		client.InNamespace(req.Namespace),
		client.MatchingFields{jobOwnerKey: req.Name},
	)
	if err != nil {
		log.Error(err, "unable to list child Jobs")
		return err
	}

	status := app.Status.DeepCopy()
	for _, job := range jobs.Items {
		isFinished := slices.ContainsFunc(job.Status.Conditions, func(c batchv1.JobCondition) bool {
			return c.Type == batchv1.JobComplete || c.Type == batchv1.JobFailed
		})
		if !isFinished {
			jobRef, err := ref.GetReference(r.Scheme, &job)
			if err != nil {
				log.Error(err, "unable to make reference to job", "job", job)
				continue
			}

			status.Jobs = append(status.Jobs, *jobRef)
		}
	}

	app.Status = *status

	return nil
}

var (
	jobOwnerKey = ".metadata.controller"
	apiGVStr    = corev1alpha1.GroupVersion.String()
)

// SetupWithManager sets up the controller with the Manager.
func (r *AppReconciler) SetupWithManager(mgr ctrl.Manager) error {
	ctx := context.Background()

	err := mgr.GetFieldIndexer().IndexField(ctx,
		&batchv1.Job{},
		jobOwnerKey,
		index,
	)
	if err != nil {
		return err
	}

	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1alpha1.App{}).
		Complete(r)
}

func index(rawObj client.Object) []string {
	job := rawObj.(*batchv1.Job)
	owner := metav1.GetControllerOf(job)
	if owner == nil {
		return nil
	}
	if owner.APIVersion != apiGVStr || owner.Kind != "App" {
		return nil
	}

	return []string{owner.Name}
}
