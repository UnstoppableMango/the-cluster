package option

type ptr[T any] interface{ ~*T }

type Option[T any] interface {
	~func(T)
}

type Immutable[T any] interface {
	~func(T) T
}

type Maybe[T any] interface {
	~func(T) error
}

func Apply[T any, O Option[T]](opts T, options ...O) {
	ApplyAll(opts, options)
}

func ApplyAll[T any, O Option[T]](opts T, options []O) {
	for _, option := range options {
		option(opts)
	}
}

func TryApply[T any, O Maybe[T]](opts T, options ...O) error {
	return TryApplyAll(opts, options)
}

func TryApplyAll[T any, O Maybe[T]](opts T, options []O) error {
	for _, option := range options {
		if err := option(opts); err != nil {
			return err
		}
	}

	return nil
}

func With[T any, O Immutable[T]](opts T, options ...O) T {
	return WithAll(opts, options)
}

func WithAll[T any, O Immutable[T]](opts T, options []O) T {
	for _, option := range options {
		opts = option(opts)
	}

	return opts
}

func Mut[T any, P ptr[T], I Immutable[T]](option func(P)) I {
	return func(x T) T {
		option(&x)
		return x
	}
}
