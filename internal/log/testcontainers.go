package util

import (
	"io"

	"github.com/testcontainers/testcontainers-go"
)

type TestcontainersLogger struct {
	stdout, stderr io.Writer
}

func AcceptAll(w io.Writer) TestcontainersLogger {
	return TestcontainersLogger{w, w}
}

// Accept implements testcontainers.LogConsumer.
func (t TestcontainersLogger) Accept(l testcontainers.Log) {
	switch l.LogType {
	case "STDOUT":
		t.stdout.Write(l.Content)
	case "STDERR":
		t.stderr.Write(l.Content)
	}
}

var _ testcontainers.LogConsumer = TestcontainersLogger{}
