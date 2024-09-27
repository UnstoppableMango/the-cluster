package adapters

import (
	"fmt"
	"io"

	charm "github.com/charmbracelet/log"
	kind "sigs.k8s.io/kind/pkg/log"
)

type writerToKind struct{ log io.Writer }

// Enabled implements log.InfoLogger.
func (w *writerToKind) Enabled() bool { return true }

// Info implements log.InfoLogger.
func (w *writerToKind) Info(message string) { w.write(message) }

// Infof implements log.InfoLogger.
func (w *writerToKind) Infof(format string, args ...interface{}) { w.writef(format, args...) }

// Error implements log.Logger.
func (w *writerToKind) Error(message string) { w.write(message) }

// Errorf implements log.Logger.
func (w *writerToKind) Errorf(format string, args ...interface{}) { w.writef(format, args...) }

// V implements log.Logger.
func (w *writerToKind) V(kind.Level) kind.InfoLogger { return w }

// Warn implements log.Logger.
func (w *writerToKind) Warn(message string) { w.write(message) }

// Warnf implements log.Logger.
func (w *writerToKind) Warnf(format string, args ...interface{}) { w.writef(format, args...) }

func (w *writerToKind) write(message string) {
	w.log.Write([]byte(message))
}

func (w *writerToKind) writef(format string, args ...interface{}) {
	w.log.Write([]byte(fmt.Sprintf(format, args...)))
}

var _ kind.Logger = &writerToKind{}
var _ kind.InfoLogger = &writerToKind{}

func WriterToKind(writer io.Writer) kind.Logger {
	return &writerToKind{writer}
}

// WriterToCharm creates a charmbracelet logger from an io.Writer.
// I realize thats what log.New() does out of the box, but I'm OCD let me have this.
func WriterToCharm(logger io.Writer) *charm.Logger {
	return charm.New(logger)
}
