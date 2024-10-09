package result

import (
	"errors"
	"fmt"
)

type Result[T any] func() (T, error)

func (r Result[T]) Err() error {
	_, err := r()
	return err
}

func (r Result[T]) Value() T {
	t, _ := r()
	return t
}

func (r Result[T]) IsErr() bool {
	return r.Err() != nil
}

func (r Result[T]) IsOk() bool {
	return !r.IsErr()
}

func (r Result[T]) Unwrap() (T, error) {
	return r()
}

func Ok[T any](v T) Result[T] {
	return func() (T, error) {
		return v, nil
	}
}

func Err[T any](err error) Result[T] {
	return func() (T, error) {
		return zero[T](), err
	}
}

func Error[T any](text string) Result[T] {
	return Err[T](errors.New(text))
}

func Errorf[T any](format string, a ...any) Result[T] {
	return Err[T](fmt.Errorf(format, a...))
}

func From[T any](v T, err error) Result[T] {
	return func() (T, error) {
		return v, err
	}
}

func zero[T any]() T {
	var t T
	return t
}
