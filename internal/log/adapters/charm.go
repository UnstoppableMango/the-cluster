package adapters

import (
	"strings"

	charm "github.com/charmbracelet/log"
	kind "sigs.k8s.io/kind/pkg/log"
)

type charmToKind struct{ log *charm.Logger }

// Enabled implements log.InfoLogger.
func (c *charmToKind) Enabled() bool { return true }

// Info implements log.InfoLogger.
func (c *charmToKind) Info(message string) {
	c.log.Info(strings.TrimSpace(message))
}

// Infof implements log.InfoLogger.
func (c *charmToKind) Infof(format string, args ...interface{}) {
	c.log.Infof(strings.TrimSpace(format), args...)
}

// Error implements log.Logger.
func (c *charmToKind) Error(message string) {
	c.log.Error(strings.TrimSpace(message))
}

// Errorf implements log.Logger.
func (c *charmToKind) Errorf(format string, args ...interface{}) {
	c.log.Errorf(strings.TrimSpace(format), args...)
}

// V implements log.Logger.
func (c *charmToKind) V(level kind.Level) kind.InfoLogger { return c }

// Warn implements log.Logger.
func (c *charmToKind) Warn(message string) {
	c.log.Warn(strings.TrimSpace(message))
}

// Warnf implements log.Logger.
func (c *charmToKind) Warnf(format string, args ...interface{}) {
	c.log.Warnf(strings.TrimSpace(format), args...)
}

var _ kind.Logger = &charmToKind{}
var _ kind.InfoLogger = &charmToKind{}

func CharmToKind(log *charm.Logger) kind.Logger {
	return &charmToKind{log}
}
