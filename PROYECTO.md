# Visual Guitar Theory — guitarra.cool

## Stack
Archivo único `index.html` — vanilla JS + SVG generado dinámicamente. Sin dependencias externas, sin build step. Se despliega automáticamente a guitarra.cool via GitHub + Vercel (push = deploy).

---

## Arquitectura general

### Layout (HTML/CSS)
- `header` — logo, selector de instrumento, selector de trastes, zoom
- `dtoolbar` — botón orientación H/V, menú de indicadores (flechas/líneas/texto)
- `.sidebar` — paneles de modo (Escala / Acorde / Nota)
- `.fret-area` — SVG del diapasón + barra de navegación de acordes + info-bar

### Temas
- `data-theme="dark"` en `<html>` — colores generales de la UI
- `data-neck="dark"` en `<html>` — colores del diapasón (trastes, cuerdas, puntos)
  - Opciones: `dark` | `light`
  - Variables: `--nl` (trastes), `--nut` (cejilla), `--dot` (puntos), `--nstr` (cuerdas)

---

## Datos

### Instrumentos (`INSTRUMENTS`)
```
guitar:    6 cuerdas, afinación estándar E A D G B e
bass:      4 cuerdas, E A D G
ukulele:   4 cuerdas, G C E A
ukulele_b: 4 cuerdas barítono, D G B e
```
Cada instrumento tiene: `strings`, `open[]` (nota abierta en semitonos desde C0), `names[]`, `thick[]` (grosor visual).

### Escalas (`SCALES`)
14 escalas: mayor, menor natural, menor armónica, menor melódica, pentatónicas, blues, modos griegos, tonos enteros, disminuida.

### Acordes (`CHORD_TYPES`)
~40 tipos: tríadas, 6ª, 7ª, 9ª, 11ª/13ª, alterados. Agrupados en `CHORD_GROUPS` para el selector.

### Colores de intervalos (`INT_COLORS`)
Cada intervalo (0–21 semitonos) tiene su color fijo. La tónica siempre es naranja `#e8a838`.

---

## Estado principal
```js
mode          // 'scale' | 'chord' | 'note'
instrumentKey // 'guitar' | 'bass' | 'ukulele' | 'ukulele_b'
orientation   // 'h' | 'v'
zoom          // 0.3 – 3.5
chordType     // key de CHORD_TYPES, e.g. 'min7'
customIntervals // array de semitonos si el usuario armó un acorde custom
voicings      // array de posiciones generadas
voicingIdx    // índice de la posición actual
vMode         // 'iso' (posición aislada) | 'all' (todas las notas)
selectedNoteRoot / selectedInterval  // modo Nota
annotations   // array de flechas/líneas/textos dibujados
```

---

## Función clave: `drawFretboard()`

Genera el SVG completo como string HTML y lo inyecta.

### Constantes de layout
```
FW=46  ancho por traste (px)
SH=36  separación entre cuerdas (px)
LP=40, RP=40  padding izquierdo/derecho
TP=30, BP=30  padding top/bottom
ANN_PAD=90    padding para anotaciones
```

### Orientación
- **Horizontal** (default): SVG normal, nut a la izquierda
- **Vertical**: el grupo `<g id="cg">` lleva `transform="translate(svgH,0) rotate(90)"`, que mapea (x,y)→(svgH-y, x). Resultado: nut arriba, cuerdas corren horizontal.

### Mapeo de cuerdas `si(s)`
```js
// s = posición visual (0=arriba, NS-1=abajo)
// retorna el índice en INSTRUMENTS[].open/names/thick

horizontal: si(s) = NS-1-s  → E grave abajo, e aguda arriba
vertical:   si(s) = s        → E grave arriba, A segunda desde arriba
```

### Texto contra-rotado en modo vertical
```js
const T=(x,y) => orientation==='v' ? ` transform="rotate(-90,${x},${y})"` : ''
```
Se aplica a TODOS los textos del SVG (nombres de cuerda, números de traste, nombres de nota en círculos).

---

## Modo Acorde

### Generación de voicings (`generateVoicings`)
Busca posiciones válidas iterando `lo` (traste inicial 0–12). Para cada posición intenta asignar a cada cuerda el primer traste en rango que pertenezca al acorde. Filtra: mínimo 2 cuerdas tocadas, debe incluir la raíz, debe cubrir al menos 2 notas distintas del acorde.

### Navegación
- Barra `voicing-bar` visible solo en modo acorde
- Botones ◀ ▶ o teclas ← → del teclado
- Tab "Posición" (aislada) / "Todas las notas"

### Constructor por intervalos (iBuilder)
Permite construir acordes custom seleccionando intervalos. Si el resultado coincide con un acorde conocido, lo muestra; si no, lo llama "Custom".

---

## Herramienta de anotaciones
- Modos: cursor, flecha, línea, texto
- Dibujadas en capa `<g id="annotation-layer">` encima del diapasón
- Se limpian al cambiar orientación
- Undo (último) y limpiar todo

---

## Ideas / Roadmap pendiente
- [ ] Compartir diapasón como imagen (export SVG/PNG)
- [ ] URL shareable con estado encoded (escala, tonalidad, etc.)
- [ ] Modo "práctica": mostrar nota, adivinar posición
- [ ] Fingering numbers en las notas del acorde (1, 2, 3, 4)
- [ ] Indicador de cejilla (barre chord) automático
- [ ] Modo oscuro/claro toggle
- [ ] Soporte táctil / mobile (swipe para navegar voicings)
- [ ] Sonido: tocar la nota al hacer clic en un círculo (Web Audio API)
- [ ] Modo comparación: dos escalas/acordes superpuestos

---

## Deploy
- Repo GitHub → Vercel → guitarra.cool
- Push a `main` = deploy automático en ~30 segundos
- El archivo `index.html` ES el sitio completo, no hay build
