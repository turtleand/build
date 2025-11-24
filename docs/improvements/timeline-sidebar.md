# Landscape Timeline Sidebar — Behavior & Pitfalls

This document captures the intended behavior for the landscape-only timeline sidebar on post pages, along with the current failing behavior to guide future fixes.

## Intended Behavior
- **When it shows**: Only on ultra-wide, landscape viewports (≥1700px). On mobile and regular desktop widths, no sidebar should appear.
- **Positioning**: The article stays centered and wide; the sidebar sits to the left, outside the article column, without shifting or overlapping content.
- **Contents**: Auto-generated from Markdown headings (h2/h3) as a vertical timeline list, with anchor links to sections and sticky positioning on scroll.
- **Toggle UX**: Two buttons (in the sidebar header and above the article) share state. Clicking “Hide timeline” should:
  - Hide the sidebar container entirely.
  - Swap the button label to “Show timeline” and update `aria-pressed`.
  - Restore the sidebar when clicked again, with labels/ARIA flipping back.
- **Graceful fallback**: If headings are missing, the layout should omit the sidebar markup so nothing appears.

## Current Failing Behavior (to fix)
- **Hide toggle has no effect**: Clicking “Hide timeline” does not remove the sidebar; it remains visible even though the toggle labels change. The JS currently toggles classes/`hidden`/inline styles, but the sidebar still renders, suggesting either the wrong element is being controlled or CSS is overriding visibility.
- **CSS/JS coupling risk**: The hide/show relies on both a class (`timeline-hidden`) and media-query display rules. If the wrapper’s computed display stays `block` at the breakpoint, the toggle cannot collapse it.
- **Next fix direction**: Ensure the toggle targets the actual rendered wrapper element and applies a hard `display: none` (or `hidden`) that cannot be overridden by breakpoint CSS. Verify on a page with multiple headings at ≥1700px width that the sidebar fully disappears and reappears.
