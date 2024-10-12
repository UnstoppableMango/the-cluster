package fs

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type Writer func(*Writable) error

func With(fs thecluster.Fs, writers ...Writer) (thecluster.Fs, error) {

}
