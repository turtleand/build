package decorator

import (
	"testing"
)

func TestDecorator_CallsInnerWithParsedInt(t *testing.T) {
	called := false
	var received int

	inner := func(x int) int {
		called = true
		received = x
		return 4 // arbitrary fixed value
	}

	d := Decorator(inner)

	result := d("2") // k("2") should be 2

	if !called {
		t.Fatalf("expected inner to be called")
	}
	if received != 2 {
		t.Fatalf("expected inner to be called with 2, got %d", received)
	}
	if result != "four" {
		t.Fatalf("expected result 'four', got %q", result)
	}
}

func TestDecorator_MapsInnerResultWithH(t *testing.T) {
	inner := func(x int) int {
		return 8 // regardless of input
	}

	d := Decorator(inner)

	result := d("1") // k("1") = 1, inner(1) = 8, h(8) = "eight"

	if result != "eight" {
		t.Fatalf("expected 'eight', got %q", result)
	}
}

func TestDecorator_InvalidInput(t *testing.T) {
	inner := func(x int) int {
		return x * 2
	}

	d := Decorator(inner)

	result := d("not-a-number")

	if result != "" {
		t.Fatalf("expected empty string for invalid input, got %q", result)
	}
}
