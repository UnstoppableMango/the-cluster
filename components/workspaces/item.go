package workspaces

import (
	"path/filepath"

	"github.com/charmbracelet/bubbles/list"
)

type Item struct {
	root, path string
}

func (i Item) Title() string {
	p, err := filepath.Rel(i.root, i.path)
	if err != nil {
		return err.Error()
	}

	return p
}

func (i Item) Description() string {
	return i.path
}

// FilterValue implements list.Item.
func (i Item) FilterValue() string {
	return i.path
}

var _ list.Item = Item{}

func NewItemDelegate() list.ItemDelegate {
	return list.NewDefaultDelegate()
}
