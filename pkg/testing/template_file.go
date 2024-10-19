package testing

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type TemplateFileExecuteParams struct {
	Fs    thecluster.Fs
	State any
}

type TemplateFileExecute struct {
	Err    error
	Params TemplateFileExecuteParams
}

type TemplateFile struct {
	MockName    string
	MockExecute TemplateFileExecute
}

// Execute implements thecluster.TemplateFile.
func (t *TemplateFile) Execute(fsys thecluster.Fs, state any) error {
	t.MockExecute.Params = TemplateFileExecuteParams{
		Fs:    fsys,
		State: state,
	}

	return t.MockExecute.Err
}

// Name implements thecluster.TemplateFile.
func (t *TemplateFile) Name() string {
	return t.MockName
}

var _ thecluster.TemplateFile = &TemplateFile{}
