import io from './node_modules/socket.io/client-dist/socket.io.esm.min.js';

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

const p1 = {
    x: WIDTH / 2,
    y: INITIAL_WALL_OFFSET,
    size: INITIAL_SIZE,
    color: COLOR_P1,
    angle: Math.PI * 1 / 2,
};
const p2 = {
    x: WIDTH / 2,
    y: HEIGHT - INITIAL_WALL_OFFSET,
    size: INITIAL_SIZE,
    color: COLOR_P2,
    angle: Math.PI * 3 / 2,
};

const drawPlayer = (p) => {
    g.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
    g.fillStyle = p.color;
    g.fill();
    g.beginPath();

    g.arc(p.x, p.y, p.size + 4, p.angle - Math.PI / 10, p.angle + Math.PI / 10);
    g.lineTo(p.x + (p.size + 10) * Math.cos(p.angle), p.y + (p.size + 10) * Math.sin(p.angle));
    g.closePath();
    g.fillStyle = 'white';
    g.fill();
    g.beginPath();
};

const draw = (dt) => {
    g.clearRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = 'white';
    g.fillRect(0, MIDLINE, WIDTH, 1);

    drawPlayer(p1);
    drawPlayer(p2);

    requestAnimationFrame(draw);
};

draw(0);
