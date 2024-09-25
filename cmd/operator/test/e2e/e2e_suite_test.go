/*
Copyright 2024.

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

package e2e

import (
	"context"
	"fmt"
	"testing"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/test/utils"
)

var (
	cluster    = utils.NewTestCluster()
	kubeconfig []byte
)

// Run e2e tests using the Ginkgo runner.
func TestE2E(t *testing.T) {
	RegisterFailHandler(Fail)
	_, _ = fmt.Fprintf(GinkgoWriter, "Starting thecluster suite\n")
	RunSpecs(t, "e2e suite")
}

var _ = BeforeSuite(func(ctx context.Context) {
	var (
		cancel context.CancelFunc
		err    error
	)

	ctx, cancel = context.WithDeadline(ctx, time.Now().Add(3*time.Minute))
	defer cancel()

	By("running k3s in docker")
	Expect(cluster.Start(ctx)).To(Succeed())

	By("retrieving the kubeconfig from k3s")
	kubeconfig, err = cluster.GetKubeConfig(ctx)
	Expect(err).NotTo(HaveOccurred())
})

var _ = AfterSuite(func(ctx context.Context) {
	By("stopping the cluster")
	Expect(cluster.Stop(ctx)).To(Succeed())
})
