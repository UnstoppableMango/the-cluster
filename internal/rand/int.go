package rand

import (
	"math/rand"
	"time"
)

func Int31() int32 {
	return rand.New(rand.NewSource(time.Now().UnixNano())).Int31()
}
