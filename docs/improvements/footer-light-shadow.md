# Body-to-Footer Glow

## Simple explanation

Think of the page as a sheet of paper that slowly slides onto a glowing pad. The page background stays light because of the base color, but right before the footer the colors start blending into a slightly darker tint, so it feels like the paper hits a soft shadow. At that same spot a thin beam of light and a fuzzy shadow overlap, so your eyes read it as “brighter footer below, darker body above,” even though nothing is really moving. That is why the body suddenly looks darker when it reaches the footer.

## Pseudocode view

```pseudo
themeTokens = loadThemeColors()           // page + footer colors from CSS variables
page.background = themeTokens.pageBg

footer.background = gradient(
  start: mix(themeTokens.footerBg1, themeTokens.pageBg, 80/20),
  mid: mix(themeTokens.footerBg2, themeTokens.pageBg, 60/40),
  end: mix(themeTokens.footerBg3, themeTokens.pageBg, 50/50)
)
footer.shadow = dropShadow(y:-10px, blur:35px, alpha:0.28)

divider.line = horizontalGlow(color = mix(footerText, 0% -> 15% -> 0%))

bodyFooterTransition = overlay(divider.line, footer.shadow)
// makes the body edge look darker while the footer surface looks brighter
```

## Technical explanation

- The light and dark paints come from the CSS custom properties declared for each theme (`--page-bg`, `--footer-bg-1`, `--footer-bg-2`, `--footer-bg-3`, etc.) inside `src/layouts/BlogLayout.astro:222-268`. The body uses `background: var(--page-bg)` in `src/layouts/BlogLayout.astro:277-283`, so it keeps a flat, bright tone above the footer.
- `.site-footer` now blends each footer stop with the page background using `color-mix`, creating `linear-gradient(180deg, color-mix(... --footer-bg-1 80%, --page-bg 20%) 0%, color-mix(... --footer-bg-2 60%, --page-bg 40%) 55%, color-mix(... --footer-bg-3 50%, --page-bg 50%) 100%)` in `src/layouts/BlogLayout.astro:500-505`. Mixing in the body color keeps the top of the footer closer to the page tone while still darkening toward the bottom.
- The seam is sharpened by `.footer-divider`, a 1 px strip that blends the footer text color with transparency (`color-mix`), in `src/layouts/BlogLayout.astro:586-595`. That shimmering line plus the upward shadow sell the idea that the body is floating above a lit footer, causing the eye to read a sudden darkening right before the intersection.

## Divider glow strip

### Simple explanation (age 12)

Picture a skinny flashlight laid sideways between the page and the footer. That bar is the divider. It starts almost invisible at the left edge, brightens in the middle, then fades away on the right, so it looks like a gentle beam. The gradient stops of `0%, 15%, 15%, 0%` are how the flashlight works now: the zero-percent stops make the ends fade away, and the two fifteen-percent stops stack a softer brightness in the center, which is why the beam still looks strongest in the middle where the body touches the footer, just less intense than before. Because it sits right at the meeting point, your eyes see a shiny edge on the footer and a soft shadow on the body, making the transition feel smooth.

Other ways to imagine it:
- Like rubbing a crayon lightly, pressing hardest in the center and lifting at the sides so the line looks brightest in the middle.
- Like a car headlight shining through fog—strongest straight ahead, softer at the edges.
- Like squeezing a glow stick so the liquid glows most in the center and gently dims near the ends.

### Pseudocode view (age 15)

```pseudo
divider.element = createLine(height = 1px)
divider.gradient = linearGradient(
  start = mix(footerTextColor, 0%),
  midLeft = mix(footerTextColor, 15%),
  midRight = mix(footerTextColor, 15%),
  end = mix(footerTextColor, 0%)
)
renderDivider():
  place divider.element between body and footer
  apply divider.gradient left→right to fake a glow band
```

### Technical explanation

- The markup drops `<div class="footer-divider" aria-hidden="true"></div>` right before the social links inside the footer container (`src/layouts/BlogLayout.astro:203-205`), so the divider spans the full shell width.
- Styles at `src/layouts/BlogLayout.astro:586-595` set the height to 1 px and paint a horizontal `linear-gradient(90deg, color-mix(in srgb, var(--footer-text) 0%, transparent) ... color-mix(... 15%) ... )`. Using the same `--footer-text` color for the stops keeps the glow synced with each theme.
- The two brighter 15% stops in the middle create the “flashlight” core, while the 0% stops at both ends fade to transparent, which makes the divider blend into the background and look like focused light rather than a hard border.

### How to make it subtler

	- Soften the gradient stops: inside `src/layouts/BlogLayout.astro:586-595`, lower the `color-mix(... 15%, transparent)` values even more (e.g., 10%) so the center glow is dimmer, or shift the 40%/60% stop positions closer to the edges (e.g., 45%/55%) to compress the bright zone.
- Lower the opacity of `--footer-text` for the divider only by wrapping it in another `color-mix` call (e.g., `color-mix(in srgb, var(--footer-text) 60%, transparent)`), which mutes the entire strip without touching the rest of the footer text.
- Add a `filter: blur(1px)` or slightly increase the divider height to 2 px while lowering the color intensity; blurring spreads the light and reduces the sharp line, making the transition gentler.

## Vertical glow above the divider

### Simple explanation (age 12)

Right above the thin flashlight bar, the entire footer fades from light to darker like a sunset sky. The top of the footer starts almost the same shade as the body, then slowly darkens as it drops toward the bottom edge. That vertical fade makes it feel like the body is catching the last bits of light before the footer becomes a deeper color, so the intersection looks soft instead of harsh.

### Pseudocode view (age 15)

```pseudo
footerGradient = linearGradient(
  angle = 180deg,
  stop0 = mix(footerBg1, pageBg, 80/20) (0%),
  stop1 = mix(footerBg2, pageBg, 60/40) (55%),
  stop2 = mix(footerBg3, pageBg, 50/50) (100%)
)
footer.background = footerGradient
```

### Technical explanation

- `.site-footer` applies the color-mixed gradient noted above in `src/layouts/BlogLayout.astro:500-505`, so every stop is partly made of the body color (`--page-bg`). That keeps both light and dark themes aligned while muting the contrast.
- Because the upper stop mixes 80% footer color with 20% page color, the top of the footer almost matches the body. The deeper stops mix in even more of `--page-bg`, trimming how dark the footer gets and creating a milder fade into `--footer-bg-3`.
- The gradient pairs with the divider and box-shadow so the eye reads a three-layer stack: lighter body, glowing seam, darker footer. Tweaking the stop positions or colors in this gradient is the main lever for changing how quickly the footer darkens as it approaches the divider.
