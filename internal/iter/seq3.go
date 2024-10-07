package iter

type Seq3[T, U, V any] func(yield func(T, U, V) bool)

func Singleton3[T, U, V any](t T, u U, v V) Seq3[T, U, V] {
	return func(yield func(T, U, V) bool) {
		_ = yield(t, u, v)
	}
}
