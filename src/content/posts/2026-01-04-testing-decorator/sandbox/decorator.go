package decorator

import (
	"strconv"
)

// InnerFunc is the type of the inner function: int -> int.
type InnerFunc func(int) int

// DecoratedFunc is the outer/decorated function: string -> string.
// It takes a numeric string (e.g. "2") and returns the doubled value
// as an English word (e.g. "four").
type DecoratedFunc func(string) string

// k parses a numeric string into an int.
func k(s string) (int, error) {
	return strconv.Atoi(s)
}

// h maps an int to a small English word representation.
func h(n int) string {
	words := map[int]string{
		0:  "zero",
		1:  "one",
		2:  "two",
		3:  "three",
		4:  "four",
		5:  "five",
		6:  "six",
		7:  "seven",
		8:  "eight",
		9:  "nine",
		10: "ten",
	}
	if w, ok := words[n]; ok {
		return w
	}
	return "" // empty if out of range, for simplicity
}

// A is our trusted inner function: it just multiplies by 2.
func A(x int) int {
	return x * 2
}

// Decorator wraps an InnerFunc and returns a DecoratedFunc
// that implements D = h ∘ inner ∘ k.
func Decorator(inner InnerFunc) DecoratedFunc {
	return func(s string) string {
		n, err := k(s)
		if err != nil {
			return "" // in a real system, you'd handle the error explicitly
		}

		doubled := inner(n) // A(n)
		return h(doubled)   // h(A(k(s)))
	}
}
