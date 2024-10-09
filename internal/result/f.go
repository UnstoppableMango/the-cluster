package result

func Id[T any](r Result[T]) Result[T] {
	return r
}

func Map[T, V any](r Result[T], f func(T) V) Result[V] {
	return func() (V, error) {
		if t, err := r(); err != nil {
			return zero[V](), err
		} else {
			return f(t), nil
		}
	}
}

func Bind[T, V any](r Result[T], f func(T) Result[V]) Result[V] {
	if t, err := r(); err != nil {
		return Err[V](err)
	} else {
		return f(t)
	}
}
