import { createCanvas } from 'canvas';

// const WIDTH = 828;
// const HEIGHT = 1792;
// const CENTRE_X = Math.floor(WIDTH / 2);
// const CENTRE_Y = Math.floor(HEIGHT / 2);
// const NF = 3.0;

export default async function handler(req, res) {
    const WIDTH = parseInt(req.query.width) || 828;
    const HEIGHT = parseInt(req.query.height) || 1792;
    const NF = parseFloat(req.query.nf) || 3.0;

    const CENTRE_X = Math.floor(WIDTH / 2);
    const CENTRE_Y = Math.floor(HEIGHT / 2);

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(WIDTH, HEIGHT);
    const data = imageData.data;
    const values = new Array(WIDTH * HEIGHT).fill(null);

    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomColour() {
        return [
            randomRange(0, 255),
            randomRange(0, 255),
            randomRange(0, 255),
        ];
    }

    function inBounds(x, y) {
        return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
    }

    function getIndex(x, y) {
        return y * WIDTH + x;
    }

    function getPixel(x, y) {
        if (!inBounds(x, y)) return null;
        return values[getIndex(x, y)];
    }

    function distance(x1, y1, x2, y2) {
        return Math.max(1, Math.hypot(x2 - x1, y2 - y1));
    }

    function addNoise([r, g, b], nf) {
        if (nf === 0) return [r, g, b];
        return [
            r + randomRange(-nf, nf),
            g + randomRange(-nf, nf),
            b + randomRange(-nf, nf),
        ];
    }

    function averageColour(x, y) {
        let r = 0, g = 0, b = 0, totalWeight = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                const col = getPixel(nx, ny);
                if (col) {
                    const dist = distance(x, y, nx, ny);
                    const weight = 1 / (dist * dist);
                    r += col[0] * weight;
                    g += col[1] * weight;
                    b += col[2] * weight;
                    totalWeight += weight;
                }
            }
        }
        return totalWeight > 0 ? [r / totalWeight, g / totalWeight, b / totalWeight] : [0, 0, 0];
    }

    function setPixel(x, y, colour) {
        const idx = getIndex(x, y);
        values[idx] = colour;

        const i = idx * 4;
        data[i] = Math.max(0, Math.min(255, colour[0]));
        data[i + 1] = Math.max(0, Math.min(255, colour[1]));
        data[i + 2] = Math.max(0, Math.min(255, colour[2]));
        data[i + 3] = 255;
    }

    function place(x, y, nf) {
        if (!inBounds(x, y)) return false;
        const avg = averageColour(x, y);
        const noisy = addNoise(avg, nf);
        setPixel(x, y, noisy);
        return true;
    }

    function generateImage() {
        setPixel(CENTRE_X, CENTRE_Y, randomColour());

        let x = CENTRE_X;
        let y = CENTRE_Y;
        let distance = 1;
        let placed = 1;
        const total = WIDTH * HEIGHT;

        while (placed < total) {
            for (let i = 0; i < distance; i++) y--, placed += place(x, y, NF);
            for (let i = 0; i < distance; i++) x++, placed += place(x, y, NF);
            distance++;
            for (let i = 0; i < distance; i++) y++, placed += place(x, y, NF);
            for (let i = 0; i < distance; i++) x--, placed += place(x, y, NF);
            distance++;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    generateImage();

    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
}
