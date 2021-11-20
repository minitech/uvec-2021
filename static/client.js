import io from './socket.io.esm.min.js';

// const socket = io();

let socket = io.connect('//' + document.domain + ':' + location.port);
let roomId = $(location).attr('href').split('/')[4];

socket.on('connect', function () {
    console.log("connected!");
    socket.emit('join_room', {
        'room': roomId
    });
});

socket.on('move', function (data) {
    game.move(data['move']); // something like this
});

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
const COLOR_P2 = '#cf0';
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

    g.clearRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = 'white';
    g.fillRect(0, MIDLINE, WIDTH, 1);

    drawPlayer(p1);
    drawPlayer(p2);

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
