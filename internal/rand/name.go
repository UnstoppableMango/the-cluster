package rand

import (
	"crypto/rand"
	"math/big"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func Name(size int) (string, error) {
	b := make([]rune, size)
	max := big.NewInt(int64(len(letters)))
	for i := range b {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			return "", err
		}

		b[i] = letters[n.Int64()]
	}

	return string(b), nil
}
