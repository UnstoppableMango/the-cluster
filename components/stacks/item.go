package stacks

import (
	"github.com/charmbracelet/bubbles/list"
)

type Item struct {
	name string
}

func (i Item) Name() string {
	return i.name
}

func (i Item) Title() string {
	return i.name
}

// FilterValue implements list.Item.
func (i Item) FilterValue() string {
	return i.name
}

var _ list.Item = Item{}

func NewItemDelegate() list.ItemDelegate {
	return list.NewDefaultDelegate()
}
