---
title: "Mapping Programming Conditionals to Logic Gates"
description: "How if/else correspond to boolean expressions, logic gates, and why clauses can be safely reordered."
date: 2025-11-23
tags: ["logic", "fundamentals"]
featured: false
draft: false
image:
  src: /images/posts/logic-gates.svg
  alt: "Logic gate logo"
locale: en
translationKey: conditional-equivalences
---

Conditionals are among the most common control‑flow structures in programming. Behind the scenes, they map cleanly onto Boolean algebra and digital logic. In fact, an `if / else` statement is functionally equivalent to a **2-to-1 multiplexer** (MUX): it selects one of two possible inputs based on a control signal.

A key feature of this equivalence is that **the logic is reversible**. In boolean algebra, the order of OR branches does not matter; the meaning stays the same. In code, only one branch executes depending on the boolean condition. Because of this, both the code and its logic-gate representation can be reordered without changing the result.

## If / else conditional

```python
class CarCrossingLogic:
    def __init__(
        self, 
        traffic_light_is_green: bool, 
        crossing_street_is_empty: bool, 
        has_traffic_lights: bool
    ):
        self.traffic_light_is_green : bool = traffic_light_is_green
        self.crossing_street_is_empty : bool = crossing_street_is_empty
        self.has_traffic_lights : bool = has_traffic_lights

    def can_cross(self) -> bool:
        if self.has_traffic_lights:
            return self.traffic_light_is_green
        else:
            return self.crossing_street_is_empty

    def can_cross_reordered(self) -> bool:
        # Logically equivalent; clauses are simply reordered
        if not self.has_traffic_lights:
            return self.crossing_street_is_empty
        else:
            return self.traffic_light_is_green
```

This method decides whether a car may cross an intersection.

*If the intersection has traffic lights*, the rule is simple:

> Cross only if the light is green.

*If the intersection has no lights*, use the priority rule:

> Cross only if the crossing street is empty.

## Logic Gates: Multiplexer

A multiplexer uses logic gates to select one of two possible inputs. Here, each rule is implemented with an AND gate, and the results are merged with an OR gate.

Because `has_traffic_lights` and `¬has_traffic_lights` can't both be 1, only one path can activate at a time.

This is precisely how a **2×1 multiplexer (MUX)** behaves.

```text
has_traffic_lights ─────┐
                        ├── AND ───────────┐
light_green ────────────┘                  │
                                           ├── OR ──> can_cross
has_traffic_lights ── NOT ──┐              │
                            ├── AND ───────┘
cross_empty ────────────────┘
```

### Reordered

```text
has_traffic_lights ── NOT ──┐
                            ├── AND ───────────┐
cross_empty ────────────────┘                  │
                                               ├── OR ──> can_cross
has_traffic_lights ─────┐                      │
                        ├── AND ───────────────┘
light_green ────────────┘
```

## Boolean Expression 

```isabelle
can_cross =
    (has_traffic_lights ∧ light_green) 
                    ∨ 
    (¬ has_traffic_lights ∧ cross_empty)
```

### Reordered

```isabelle
can_cross_reordered =
    (¬ has_traffic_lights ∧ cross_empty) 
                    ∨ 
    (has_traffic_lights ∧ light_green)
```

## Truth Table

```
| has_traffic_lights | light_green | cross_empty | can_cross |
| ------------------ | ----------- | ----------- | --------- |
| 0                  | 0           | 0           | 0         |
| 0                  | 0           | 1           | 1         |
| 0                  | 1           | 0           | 0         |
| 0                  | 1           | 1           | 1         |
| 1                  | 0           | 0           | 0         |
| 1                  | 0           | 1           | 0         |
| 1                  | 1           | 0           | 1         |
| 1                  | 1           | 1           | 1         |
```
