---
title: "Electricity From First Principles"
description: "A beginner-friendly engineering note that explains electricity through push, flow, work, and loop before introducing voltage, current, resistance, power, Ohm's law, and energy transfer."
date: 2026-06-26
tags: ["fundamentals", "logic", "software engineering"]
featured: false
draft: false
image:
  src: /images/posts/logic-gates.svg
  alt: "Logic gate diagram icon"
locale: en
translationKey: electricity-from-first-principles
slug: 2026-06-26-electricity-from-first-principles
---

Electricity is easier to understand when you do not start with equations.

Start with four anchors:

1. **Push**: the source gives electrical charge a reason to move.
2. **Flow**: charge moves through a path.
3. **Work**: a load turns electrical energy into light, heat, motion, computation, or signal.
4. **Loop**: the path must be complete for sustained current.

A simple circuit is not just a battery and a wire. It is a source, a path, a load, and a return path. Break the loop and the steady flow stops.

## The water analogy is training wheels

A common first metaphor is water in pipes.

Voltage is like pressure. Current is like flow rate. Resistance is like a narrow pipe or friction in the path.

That metaphor is useful, but not exact. Electrical circuits are not literally water systems. The point is only to build the first intuition: push creates possible flow, resistance limits flow, and the load receives useful energy.

Once that shape is clear, the real terms become less mysterious.

## Voltage is push

Voltage is electric potential difference. A practical way to say it is:

> Voltage is energy per unit charge.

One volt means one joule of energy for each coulomb of charge.

A higher voltage does not mean electricity is moving faster by itself. It means each unit of charge has more energy available to transfer as it moves through the circuit.

## Current is flow

Current is the rate of charge flow.

One ampere means one coulomb of charge passing a point each second.

Current needs a closed path. If the path is open, the source can still have voltage, but sustained current cannot flow around the circuit.

## Resistance limits flow

Resistance is opposition to current.

For a given voltage, more resistance means less current. Less resistance means more current.

Resistance does not make energy disappear. It shapes where energy is transferred. In many components, that transfer appears as heat. In a useful load, it may become light, motion, sound, computation, or a signal.

## Power is work per second

Power is the rate of energy transfer.

A device with more power is not merely holding more energy. It is using or delivering energy faster.

That is why a bright lamp, a warm heater, and a spinning motor can all be described through power. They are different ways of turning electrical energy into work over time.

## The two equations worth keeping

After the mental model, two equations do a lot of work.

Ohm's law:

```text
V = I × R
```

Voltage equals current times resistance. If resistance stays the same, more voltage creates more current. If voltage stays the same, more resistance reduces current.

Electrical power:

```text
P = V × I
```

Power equals voltage times current. Energy transfer depends on both the push and the flow.

A small example:

```text
5 volts × 2 amps = 10 watts
```

That means the circuit is transferring 10 joules of energy each second.

## Common beginner mix-ups

**Voltage is not current.** Voltage is energy per charge. Current is charge per second.

**Voltage can exist without sustained current.** A battery can have voltage even when it is not connected to a complete circuit.

**Current needs a loop.** A broken path stops sustained flow.

**Power is not stored energy.** Power is the rate of energy transfer. Energy is the accumulated amount over time.

**Resistance does not destroy energy.** It limits current and affects where energy is transferred.

## Bottom line

Think in this order:

1. Source creates push.
2. Closed loop permits flow.
3. Resistance limits flow.
4. Load receives energy and does useful work.
5. Power tells you how fast that work is happening.

The equations matter, but the structure matters first. Electricity is push, flow, work, and loop.
