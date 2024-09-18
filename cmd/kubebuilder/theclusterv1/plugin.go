package theclusterv1

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
	pluginKey                = plugin.KeyFor(Plugin{})
)

type Plugin struct {
	createAPISubcommand
	createWebhookSubcommand
	editSubcommand
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

// GetCreateWebhookSubcommand implements plugin.Full.
func (p Plugin) GetCreateWebhookSubcommand() plugin.CreateWebhookSubcommand {
	return &p.createWebhookSubcommand
}

// GetEditSubcommand implements plugin.Full.
func (p Plugin) GetEditSubcommand() plugin.EditSubcommand {
	return &p.editSubcommand
}

// GetInitSubcommand implements plugin.Full.
func (p Plugin) GetInitSubcommand() plugin.InitSubcommand {
	return &p.initSubcommand
}

var _ plugin.Full = Plugin{}
