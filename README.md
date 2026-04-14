# 🎸 Visual Guitar Theory

An interactive fretboard visualizer for guitar teachers and students. Explore scales, chords, and intervals across the neck — with support for multiple instruments, chord voicings, annotation tools, and zoom.

## Features

### Modes
- **Scale** — Visualize 14 scale types across the full neck. The root note appears in gold, all other scale tones in purple.
- **Chord** — Display any chord type with interval-based coloring (tonic, 3rd, 5th, 7th, etc. each in a distinct color). Navigate through all playable voicings with ← → arrows, and toggle between "all notes" and "isolated position" views.
- **Note** — Pick any root note and interval to highlight exactly where both appear across the entire neck.

### Instruments
Switch between four different instruments, each with its correct tuning and string count:
- Guitarra (6 strings, standard EADGBE)
- Bajo (4 strings, standard EADG)
- Ukelele (4 strings, GCEA)
- Ukelele Barítono (4 strings, DGBE)

### Fretboard Controls
- **Frets** — Choose between 12, 15, or 17 frets
- **Girar diapasón** — Rotate to horizontal or vertical layout; mirror left–right; flip string order
- **Zoom** — Scale the fretboard up or down with − / + buttons, reset with ↺

### Annotation Tools ("Indicadores")
Draw directly on the fretboard to create teaching materials:
- **Flecha** — Click and drag to draw an arrow
- **Línea** — Click and drag to draw a line
- **Texto** — Click anywhere (including outside the fretboard) to place a text label
- Choose color and line thickness when a drawing tool is active
- Undo the last annotation or clear all

## Usage

This is a **single HTML file** with no dependencies, no build step, and no internet connection required after download.

1. Download `guitar-visualizer.html`
2. Open it in any modern browser (Chrome, Firefox, Safari, Edge)
3. That's it

To host it on a website, rename the file to `index.html` and upload it to any static hosting service (Netlify, GitHub Pages, your own server, etc.).

## Keys & Scale Reference

| Scale | Intervals |
|---|---|
| Mayor | 1 2 3 4 5 6 7 |
| Menor natural | 1 2 ♭3 4 5 ♭6 ♭7 |
| Menor armónica | 1 2 ♭3 4 5 ♭6 7 |
| Menor melódica | 1 2 ♭3 4 5 6 7 |
| Pentatónica mayor | 1 2 3 5 6 |
| Pentatónica menor | 1 ♭3 4 5 ♭7 |
| Blues | 1 ♭3 4 ♭5 5 ♭7 |
| Dórico | 1 2 ♭3 4 5 6 ♭7 |
| Frigio | 1 ♭2 ♭3 4 5 ♭6 ♭7 |
| Lidio | 1 2 3 ♯4 5 6 7 |
| Mixolidio | 1 2 3 4 5 6 ♭7 |
| Locrio | 1 ♭2 ♭3 4 ♭5 ♭6 ♭7 |
| Tonos enteros | 1 2 3 ♯4 ♯5 ♭7 |
| Disminuida | 1 2 ♭3 4 ♭5 ♭6 6 7 |

## Chord Interval Colors

| Color | Interval |
|---|---|
| 🟡 Gold | Tónica |
| 🟢 Green | 3ª mayor |
| 🔵 Blue | 3ª menor |
| 🟣 Purple | 5ª justa |
| 🟠 Orange | 7ª menor |
| 🩷 Pink | 7ª mayor |
| 🔴 Red | Tritono |

## Built With

Pure HTML, CSS, and JavaScript — no frameworks, no libraries, no build tools.
SVG is used for the fretboard and annotations, rendered inline and updated on every state change.

## License

MIT — free to use, modify, and share.
