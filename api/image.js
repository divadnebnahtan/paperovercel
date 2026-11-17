import { generateImage } from '../lib/generate-image.js';

export default async function handler(req, res) {
    const width = parseInt(req.query.w) || 828;
    const height = parseInt(req.query.h) || 1792;
    const noise = parseFloat(req.query.nf) || 3.0;
    const canvas = generateImage(width, height, noise);
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
}
