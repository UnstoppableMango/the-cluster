package adapters

import (
	"log/slog"
	"strings"

	charm "github.com/charmbracelet/log"
	kind "sigs.k8s.io/kind/pkg/log"
)

type charmToKind struct {
	log *charm.Logger
}

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
func (c *charmToKind) V(level kind.Level) kind.InfoLogger {
	if level > 0 && c.log.Enabled(nil, slog.Level(charm.DebugLevel)) {
		if level == 1 {
			return c
		} else {
			return &debugLogger{c.log}
		}
	} else {
		return kind.NoopInfoLogger{}
	}
}

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

type debugLogger charmToKind

// Enabled implements log.InfoLogger.
func (d *debugLogger) Enabled() bool { return true }

// Info implements log.InfoLogger.
func (d *debugLogger) Info(message string) {
	d.log.Debug(strings.TrimSpace(message))
}

// Infof implements log.InfoLogger.
func (d *debugLogger) Infof(format string, args ...interface{}) {
	d.log.Debugf(strings.TrimSpace(format), args...)
}

var _ kind.InfoLogger = &debugLogger{}

func CharmToKind(log *charm.Logger) kind.Logger {
	return &charmToKind{log}
}
