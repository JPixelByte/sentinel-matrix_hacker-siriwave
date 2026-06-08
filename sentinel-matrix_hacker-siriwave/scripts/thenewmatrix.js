// Matrix Rain
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
// canvas.style.zIndex =500; // Ensure it's above the explosion container
let animationRunning = true;
let matrixTimeout;
let frameDelay = 30; // default (lower = faster rain)
let leftOffset = 0;

// --- 1. CONFIGURATION OBJECT ---
const config = {
    fontSize: 16,
    speed: 30,
    color: '#4c9a0f'
};

// --- 2. INITIALIZE GUI ---
const gui = new dat.GUI();
// gui.close(); // <--- This collapses the panel on page load

// Add GSAP Fade (Targets the entire GUI container)
// gsap.from(".dg.main", { 
//     opacity: 0, 
//     y: -200, 
//     duration: 1.5, 
//     delay: 0.5, 
//     ease: "power2.out" 
// });

// Start of: GSAP Animations for GUI
gsap.fromTo(".dg.main", { opacity: 0.5, y: -80, duration: 1.5 , delay: 0.5, ease: "power2.out" }, { opacity: 1, y:30, duration: 1 , delay: 0.5, ease: "elastic.out" });
// gsap.fromTo(".dg.main", { opacity: 1, y: 200, duration: 1.5 , delay: 0.5, ease: "power2.out" }, { opacity: 1, y:100, duration: 1 , delay: 0.5, ease: "elastic.out" });

// gsap.timeline({
//   onComplete: myFunction,
//   repeat: 2,
//   repeatDelay: 1,
//   yoyo: true,
// });

// End of: GSAP Animations for GUI

gui.add(config, 'fontSize', 8, 100).step(1).name('Size:').listen().onChange(value => {
  config.fontSize = value;
  fontSizes = [value];
  columnWidth = value;           // MUST come BEFORE initRain

  initRain();                    // recalculates columns + offset + drops
  ctx.fillStyle = '#000';        // solid black erase (stronger than 0.05 fade)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix();                  // immediate redraw with new centered grid
});

// Speed slider – only affects animation rate
gui.add(config, 'speed', 5, 100).name('Speed:').listen().onChange(value => {
  //THIS REVERSED THE SPEED CONTROL: left scrub made it go faster, right scrub made it slower. Adjusting the mapping to fix that.
  //frameDelay = value;   // higher = slower rain (longer delay between frames)
  frameDelay = 105 - value;  // Magic number: 5 → delay 100 (slow), 100 → delay 5 (fast)
  config.speed = value; // keep config in sync
});

// 1. Physically remove the Open/Close button elements from the DOM
const buttons = gui.domElement.querySelectorAll('.close-button, .open-button');
buttons.forEach(btn => btn.remove());

// --- 3. RE-INITIALIZATION FUNCTION ---
function initRain() {
  columnWidth = config.fontSize; // keep spacing = font size
  columns = Math.floor(canvas.width / columnWidth);

  // Center the grid
  const totalGridWidth = columns * columnWidth;
  leftOffset = Math.floor((canvas.width - totalGridWidth) / 2);

  // Reset drops
  drops = Array(columns).fill(1);
}


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

let fontSizes = JSON.parse(localStorage.getItem('matrixFontSizes')) || [14];
let colors = JSON.parse(localStorage.getItem('matrixColors')) || ['#00ff00'];
let columnWidth = Math.max(...fontSizes, 14);

const columns = () => Math.floor(canvas.width / columnWidth);
let drops = [];

function resetDrops() {
    drops = Array(columns()).fill(1);
}
resetDrops();

function drawMatrix() {
    if (!animationRunning) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drops.forEach((y, i) => {
        const size = fontSizes[Math.floor(Math.random() * fontSizes.length)];
        ctx.font = `${size}px monospace`;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * columnWidth + leftOffset, y * size);
        // ctx.fillText(text, i * columnWidth, y * size);

        if (y * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });

    // if (animationRunning) matrixTimeout = setTimeout(drawMatrix, 50);
       if (animationRunning) matrixTimeout = setTimeout(drawMatrix, frameDelay);
}

function startRain() {
    animationRunning = true;
    document.getElementById('toggle-icon').classList.remove('fa-play');
    document.getElementById('toggle-icon').classList.add('fa-pause');
    drawMatrix();
}

function pauseRain() {
    animationRunning = false;
    clearTimeout(matrixTimeout);
    document.getElementById('toggle-icon').classList.remove('fa-pause');
    document.getElementById('toggle-icon').classList.add('fa-play');
}

startRain();

// Toggle
document.getElementById('rain-toggle').addEventListener('click', () => {
    if (animationRunning) pauseRain();
    else startRain();
});

// Modal
const modal = document.getElementById('cyber-modal');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.querySelector('.close-modal');
const applyBtn = document.getElementById('apply-changes');

let isValueConfirmation = false;

function showCyberModal(text, isConfirmation = false) {
    modalMessage.textContent = text;
    isValueConfirmation = isConfirmation;
    applyBtn.style.display = isConfirmation ? 'block' : 'none';
    modal.showModal();
    pauseRain();
}

closeModalBtn.addEventListener('click', () => {
    modal.close();
    startRain();
    isValueConfirmation = false;
});

applyBtn.addEventListener('click', () => {
    modal.close();
    isValueConfirmation = false;
    columnWidth = Math.max(...fontSizes, 14);
    resetDrops();
    startRain();
    document.getElementById('output').innerHTML += '<br>[Core]: Injection confirmed & applied.';
});

// Input Processing
const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');
const executeBtn = document.getElementById('execute-btn');

let currentKeyword = null;

function processInput() {
    const value = inputEl.value.trim();
    if (!value) return;

    inputEl.value = '';

    if (currentKeyword) {
        let message = `Values injected for ${currentKeyword}:\n${value}`;
        if (currentKeyword.startsWith('size') || currentKeyword.startsWith('sizes')) {
            fontSizes = parseSizes(value, currentKeyword);
            localStorage.setItem('matrixFontSizes', JSON.stringify(fontSizes));
            message += `\nNew sizes: ${fontSizes.join('px, ') + 'px'}`;
        } else if (currentKeyword.startsWith('color') || currentKeyword.startsWith('colors')) {
            colors = parseColors(value);
            localStorage.setItem('matrixColors', JSON.stringify(colors));
            message += `\nNew colors: ${colors.join(', ')}`;
        }
        showCyberModal(message, true);
        currentKeyword = null;
        inputEl.placeholder = 'Inject 🗝️ Keyword directive...';
        return;
    }

    const lower = value.toLowerCase();

    if (['size', 'sizes', 'color', 'colors'].some(kw => lower.startsWith(kw))) {
        currentKeyword = value;
        inputEl.placeholder = 'inject your values...';
        showCyberModal(`Keyword accepted: ${value}\n\nNow enter your value(s) and press Execute.\n\nExamples:\n- size: 26\n- sizes: 12,24,48,66\n- sizes: 12-100\n- colors: rgb(15, 196, 15), red, #22853b, cherry`, false);
        return;
    }

    let output = 'Processing... ';
    output += `Evolving interpretation of "${value}"`;
    outputEl.innerHTML = output;
}

executeBtn.addEventListener('click', processInput);
inputEl.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        processInput();
    }
});

// Helpers
function parseSizes(input, keyword) {
    let sizes = [];
    if (input.includes('-')) {
        const [min, max] = input.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
            for (let i = 0; i < 4; i++) {
                sizes.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
        }
    } else {
        sizes = input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 12 && n <= 66);
    }
    return sizes.length ? sizes.slice(0, 4) : [14];
}

function parseColors(input) {
    let parsed = input.split(',').map(c => c.trim()).filter(c => c);
    return parsed.length ? parsed.slice(0, 4) : ['#00ff00'];
}

// Training
let model;
async function initBrain() {
    model = tf.sequential({
        layers: [
            tf.layers.dense({inputShape: [10], units: 50, activation: 'relu'}),
            tf.layers.dense({units: 20, activation: 'relu'}),
            tf.layers.dense({units: 1, activation: 'sigmoid'})
        ]
    });
    model.compile({optimizer: 'adam', loss: 'binaryCrossentropy'});
    console.log('Neural core online.');
}
initBrain();

document.getElementById('train-good').addEventListener('click', async () => {
    const xs = tf.tensor2d([[1,0,0,0,0,0,0,0,0,0]]);
    const ys = tf.tensor2d([[1]]);
    await model.fit(xs, ys, {epochs: 1});
    showCyberModal('Neural pathway strengthened.\nCore is adapting...', false);
});

document.getElementById('train-bad').addEventListener('click', () => {
    showCyberModal('Suboptimal node purged.\nError logged — continuing evolution.', false);
});

// Self-modify
setInterval(() => {
    if (Math.random() > 0.95) {
        outputEl.innerHTML += '\n[Core]: Self-auditing... Adding <meta name="sentient" content="v1.1">';
        document.head.insertAdjacentHTML('beforeend', '<meta name="sentient" content="v1.1">');
    }
}, 70000);