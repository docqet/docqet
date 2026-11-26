# Docqet's logo

The mark is a folded page shaped as a capital D. It holds two rules, each a
faint track for what the software is meant to do and a fill for how much of
it the code meets: one met, one halfway. It's Docqet in one shape: intention
written down, beside the code, with the difference in plain sight.

The violet tile is the same in light and dark mode. Every color is solid, with
no transparency, so the mark looks the same wherever it's placed.

## Files

| File                                                                                          | Use it for                                                                          |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`docqet-mark.svg`](docqet-mark.svg)                                                          | The mark, at 32px and up                                                            |
| [`docqet-mark-small.svg`](docqet-mark-small.svg)                                              | The mark at 24px and below, such as a favicon: the unmet track is a step darker     |
| [`docqet-lockup-light.svg`](docqet-lockup-light.svg), [`-dark`](docqet-lockup-dark.svg)       | The mark and wordmark, on light or dark backgrounds                                 |
| [`docqet-mark-mono-violet.svg`](docqet-mark-mono-violet.svg), [`-white`](docqet-mark-mono-white.svg) | One color, without the tile: a docs sidebar, inline text, or anywhere a tile is too heavy |
| [`docqet-lockup-mono-light.svg`](docqet-lockup-mono-light.svg), [`-dark`](docqet-lockup-mono-dark.svg) | The one-color mark with the wordmark                                           |
| [`docqet-avatar.svg`](docqet-avatar.svg)                                                      | Avatars that get rounded for you, such as the GitHub organization: full-bleed, no tile |
| [`docqet-social-preview.svg`](docqet-social-preview.svg)                                      | A repository's social preview on GitHub, 1280×640                                   |
| [`favicon.ico`](favicon.ico)                                                                  | Browsers that don't take an SVG icon: 16, 24, 32 and 48px                           |
| [`png/`](png/)                                                                                | PNGs of the mark (16 to 1024px), the avatar (500 and 1024px), the lockups (48 and 96px high) and the social preview |

The UI has its own copies: [`ui/public/favicon.svg`](../../../ui/public/favicon.svg),
the small mark, and `apple-touch-icon.png`, the avatar at 180px. In the UI the
mark is drawn by [`Logo.tsx`](../../../ui/src/components/shell/Logo.tsx) from
the theme's `brand` colors.

The wordmark is "docqet" in lowercase, Geist at weight 650, tracked −0.03em,
fading from the text color to violet. In the lockups it's outlined, so it
doesn't need the font.

## Colors

| Token        | Color     | Is                                  |
| ------------ | --------- | ----------------------------------- |
| `light`      | `#a78bfa` | The tile's gradient, top left       |
| `main`       | `#7c3aed` | The tile's gradient, middle         |
| `dark`       | `#5b21b6` | The tile's gradient, bottom right   |
| `mark`       | `#ffffff` | The page                            |
| `fold`       | `#cab9fc` | The page's folded corner            |
| `track`      | `#eae0fc` | A rule's track, what's meant        |
| `trackSmall` | `#ddd0fb` | The track at 24px and below         |
| `fill`       | `#ae85f4` | A rule's fill, what's met           |

## Using it

- Keep clear space around the mark of at least a quarter of its width.
- Don't recolor the tile, rotate the mark, or change the rules' lengths.
- On a background that fights the tile, use a one-color version.
