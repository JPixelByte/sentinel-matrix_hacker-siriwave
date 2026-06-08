# sentinel-matrix_hacker
This is an interactive matrix rain app with lots of fun stuff to play with.
# Sentinel Matrix Hacker

Awakening... Sentinel, command me.

A living, injectable, sentient Matrix rain simulation built in HTML5 Canvas + JavaScript.  
Type commands, drag particles, scrub sliders, summon colors — watch the code fall forever.

永 — eternity.

https://user-images.githubusercontent.com/xxxxxxx/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.gif  <!-- optional: add a short demo GIF here -->

## Features

- Classic green Matrix rain with falling katakana & binary
- Live command-line control via keyword injection:
  - `size 26` — single font size
  - `sizes 12,24,48,66` — multiple sizes
  - `sizes 12-100` — random sizes in range
  - `color #0f0` / `color lime` — single color
  - `colors #0f0, red, #22853b, cherry` — multi-color palette
- Native HTML color picker (draggable, live preview)
- dat.GUI sliders for Size & Speed (with GSAP elastic spring animation)
- Draggable particle emitter with GSAP explosions (hover/click)
- Instructions modal with exploding GSAP particles & 永 symbol
- Bottom-left button cycles randomized Matrix-themed sentences (glitch reveal effect)
- Pause/resume toggle with neon play/pause icon
- Full-screen responsive canvas with window resize handling
- GSAP animations throughout (fades, springs, pulses)

## Screenshots

![Matrix Rain with GUI and emitter](screenshots/main-view.png)
*Live rain, native color picker, dat.GUI controls, particle emitter*

![Instructions Modal](screenshots/help-modal.png)
*GSAP exploding help menu with 永 eternity symbol*

![Color Picker Open](screenshots/color-picker-open.png)
*Native browser color wheel + live hex display*

## How to Use

1. Clone or download the repo
2. Open `index.html` in a modern browser (Brave/Chrome recommended)
3. Enjoy the falling code

**Command examples** (type in the input field + Execute):
- `size 42`
- `sizes 12, 24, 48, 66`
- `sizes 12-100`
- `color #ff0000` or `color red`
- `colors #0f0, lime, #00ff41, cherry`

**GUI controls**:
- Top-right dat.GUI panel: Size & Speed sliders
- Bottom floating color picker: click to open native wheel
- Draggable green ? emitter: hover/click for GSAP particle explosions
- Bottom-left cycle button: random Matrix wisdom sentences
- Pause/play toggle (bottom-right glowing icon)
- Command Line prompts to modify the color, colors, size or sizes: Maximum color and sizes total 4.
- A dat GUI size and speed scrubber.

  Bug Remaining: is that the dat GUI slider size scrubber, pushes the rain to the left but recenters when you make the matrix rain bigger.
  The command line size injections do not.

## Tech Stack

- HTML5 Canvas
- CSS
- JavaScript (vanilla)
- GSAP (animations, springs, particles)
- dat.GUI (sliders – optional, can be removed)
- Native `<input type="color">` & `<input type="range">`
- Font Awesome (icons)

## Installation / Local Development

```bash
git clone https://github.com/Captainancient/sentinel-matrix-hacker.git
cd sentinel-matrix-hacker
# Open index.html in browser

Credits: Mr. Frosty, Google, GSAP and one who wishes to remain anonymous
