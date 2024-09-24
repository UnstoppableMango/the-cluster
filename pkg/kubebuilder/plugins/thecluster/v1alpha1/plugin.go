package v1alpha1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	cfgv3 "sigs.k8s.io/kubebuilder/v4/pkg/config/v3"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/stage"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang"
)

const pluginName = "thecluster." + golang.DefaultNameQualifier

var (
	pluginVersion            = plugin.Version{Number: 1, Stage: stage.Alpha}
	SupportedProjectVersions = []config.Version{cfgv3.Version}
)

type Plugin struct {
	createAPISubcommand
	initSubcommand
}

// Name implements plugin.Plugin.
func (Plugin) Name() string { return pluginName }

// SupportedProjectVersions implements plugin.Plugin.
func (Plugin) SupportedProjectVersions() []config.Version { return SupportedProjectVersions }

// Version implements plugin.Plugin.
func (Plugin) Version() plugin.Version { return pluginVersion }

// GetCreateAPISubcommand implements plugin.Full.
func (p Plugin) GetCreateAPISubcommand() plugin.CreateAPISubcommand {
	return &p.createAPISubcommand
}

// GetInitSubcommand implements plugin.Full.
func (p Plugin) GetInitSubcommand() plugin.InitSubcommand {
	return &p.initSubcommand
}

// DeprecationWarning implements plugin.Deprecated.
func (p Plugin) DeprecationWarning() string {
	return ""
}

var _ plugin.Plugin = Plugin{}
var _ plugin.Init = Plugin{}
var _ plugin.CreateAPI = Plugin{}
var _ plugin.Deprecated = Plugin{}
