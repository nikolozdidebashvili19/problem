# T-001 — Design direction for Problem.ge

Phase 0 · Status: **done** · Depends on: —

## Goal
CLAUDE.md §19 is still locked to the template's previous identity ("SaaS dashboard / B2B", indigo, dashboard app-shell).
Problem.ge is a mobile-first civic consumer app, so the direction must be reset and re-locked before any UI ticket (015+).

## Steps
1. Owner confirms reset: set `STATUS: unset` in CLAUDE.md §19.
2. Ask the four design questions (Product, Palette, Type, Feel) via AskUserQuestion.
3. Typography MUST include Georgian glyphs (PRODUCT §12.5): e.g. Noto Sans Georgian / FiraGO for body; verify the display face covers Georgian or pair it.
4. Write answers into the block, set `STATUS: locked`.
5. Map palette → `src/app/globals.css`, fonts → `src/app/layout.tsx`, motion utilities → `@layer utilities`.
6. Status badges need text + color (WCAG, PRODUCT §16) — reserve status colors alongside the accent.

## AC
- §19 block reflects Problem.ge, not the template.
- Georgian text renders in the chosen face (no fallback font); long Georgian words don't overflow buttons.

## Implementation notes
- Locked 2026-11-01 from the owner's brief: forum-style civic feed, white surfaces, gray borders, dark text, blue accents, orange buttons.
- Orange is `orange-700` (#C2410C) so white button text passes WCAG AA; blue (#2563EB) is the `link` token used for links, focus and active nav.
- Fonts: Inter + Noto Sans Georgian (per-glyph fallback), wired in `layout.tsx` / `globals.css`.
- Brief items handled elsewhere: report form → T-016, map view → T-035, profiles → T-028.
  **Comments** are a PRODUCT §2 non-goal for v1 (moderation load) — cards show no comment count until Phase 2.
