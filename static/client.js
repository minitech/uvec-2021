import io from './socket.io.esm.min.js';

const socket = io();

const canvas = document.getElementById('canvas');

canvas.width *= devicePixelRatio;
canvas.height *= devicePixelRatio;

const g = canvas.getContext('2d');
g.scale(devicePixelRatio, devicePixelRatio);

const WIDTH = 800;
const HEIGHT = 600;
const MIDLINE = HEIGHT / 2 - 0.5;
const INITIAL_SIZE = 35;
const INITIAL_WALL_OFFSET = 100;
const COLOR_P1 = '#0cf';
const COLOR_P1_FIELD = '#024';
const COLOR_P2 = '#cf0';
const COLOR_P2_FIELD = '#240';
const FRICTION_DECELERATION = 0.2;
const ACCELERATION = 0.6;
const MAX_SPEED = 8;

const p1 = {
    x: WIDTH / 2,
    y: INITIAL_WALL_OFFSET,
    size: INITIAL_SIZE,
    color: COLOR_P1,
    fireDirection: Math.PI * 1 / 2,
    velocityX: 0,
    velocityY: 0,
};
const p2 = {
    x: WIDTH / 2,
    y: HEIGHT - INITIAL_WALL_OFFSET,
    size: INITIAL_SIZE,
    color: COLOR_P2,
    fireDirection: Math.PI * 3 / 2,
    velocityX: 0,
    velocityY: 0,
};

const drawPlayer = (p) => {
    g.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    g.fillStyle = p.color;
    g.fill();
    g.beginPath();

    g.arc(p.x, p.y, p.size + 4, p.fireDirection - Math.PI / 10, p.fireDirection + Math.PI / 10);
    g.lineTo(p.x + (p.size + 10) * Math.cos(p.fireDirection), p.y + (p.size + 10) * Math.sin(p.fireDirection));
    g.closePath();
    g.fillStyle = 'white';
    g.fill();
    g.beginPath();
};

const drawCursor = () => {
    g.arc(cursorX, cursorY, 2, 0, 2 * Math.PI);
    g.fillStyle = 'white';
    g.fill();
    g.beginPath();

    g.arc(cursorX, cursorY, 12, 0, 2 * Math.PI);
    g.lineWidth = 2;
    g.strokeStyle = 'white';
    g.stroke();
    g.beginPath();
};

const fixedUpdate = () => {
    const forceX = -((keys & KEY_LEFT) !== 0) + ((keys & KEY_RIGHT) !== 0);
    const forceY = -((keys & KEY_UP) !== 0) + ((keys & KEY_DOWN) !== 0);

    if (forceX === 0 && forceY === 0) {
        const speed = Math.hypot(p2.velocityX, p2.velocityY);

        if (speed > 0) {
            const newSpeed = Math.max(0, speed - FRICTION_DECELERATION);
            p2.velocityX *= newSpeed / speed;
            p2.velocityY *= newSpeed / speed;
        }
    } else {
        const h = Math.hypot(forceX, forceY);
        p2.velocityX += forceX / h * ACCELERATION;
        p2.velocityY += forceY / h * ACCELERATION;

        const speed = Math.hypot(p2.velocityX, p2.velocityY);

        if (speed > MAX_SPEED) {
            p2.velocityX *= MAX_SPEED / speed;
            p2.velocityY *= MAX_SPEED / speed;
        }
    }

    p2.x += p2.velocityX;
    p2.y += p2.velocityY;

    if (p2.x - p2.size < 0) {
        p2.x = p2.size;
        p2.velocityX = 0;
    } else if (p2.x + p2.size > WIDTH) {
        p2.x = WIDTH - p2.size;
        p2.velocityX = 0;
    }

    if (p2.y < HEIGHT / 2) {
        p2.y = HEIGHT / 2;
        p2.velocityY = 0;
    } else if (p2.y + p2.size > HEIGHT) {
        p2.y = HEIGHT - p2.size;
        p2.velocityY = 0;
    }
};

const FIXED_STEP = 16;

let res = 0;
let last = -1;

const update = (dt) => {
    res += dt;

    while (res > FIXED_STEP) {
        res -= FIXED_STEP;
        fixedUpdate();
    }
};

const draw = (t) => {
    update(t - last);
    last = t;

    p2.fireDirection = Math.atan2(cursorY - p2.y, cursorX - p2.x);

    g.clearRect(0, 0, WIDTH, HEIGHT);

    g.globalCompositeOperation = 'lighten';
    g.fillStyle = COLOR_P1_FIELD;
    g.fillRect(0, 0, WIDTH, MIDLINE + 30);
    g.fillStyle = COLOR_P2_FIELD;
    g.fillRect(0, MIDLINE - 30, WIDTH, MIDLINE + 30);
    g.globalCompositeOperation = 'source-over';

    drawPlayer(p1);
    drawPlayer(p2);

    drawCursor();

    requestAnimationFrame(draw);
};

requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(draw);
});

const KEY_UP = 1 << 0;
const KEY_LEFT = 1 << 1;
const KEY_DOWN = 1 << 2;
const KEY_RIGHT = 1 << 3;
const KEY_SPRINT = 1 << 4;
let keys = 0;

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys |= KEY_UP;
            break;
        case 'a':
        case 'ArrowLeft':
            keys |= KEY_LEFT;
            break;
        case 's':
        case 'ArrowDown':
            keys |= KEY_DOWN;
            break;
        case 'd':
        case 'ArrowRight':
            keys |= KEY_RIGHT;
            break;
        default:
            return;
    }

    e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys &= ~KEY_UP;
            break;
        case 'a':
        case 'ArrowLeft':
            keys &= ~KEY_LEFT;
            break;
        case 's':
        case 'ArrowDown':
            keys &= ~KEY_DOWN;
            break;
        case 'd':
        case 'ArrowRight':
            keys &= ~KEY_RIGHT;
            break;
        default:
            return;
    }

    e.preventDefault();
});

let cursorX = WIDTH / 2;
let cursorY = HEIGHT / 2;

document.addEventListener('mousemove', (e) => {
    cursorX += e.movementX;
    cursorY += e.movementY;

    if (cursorX < 0) {
        cursorX = 0;
    } else if (cursorX > WIDTH) {
        cursorX = WIDTH;
    }

    if (cursorY < 0) {
        cursorY = 0;
    } else if (cursorY > HEIGHT) {
        cursorY = HEIGHT;
    }
});

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

socket.on('position', (p) => {
    console.log(p);
});
