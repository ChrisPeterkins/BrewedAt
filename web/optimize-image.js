const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function optimizeImage() {
  try {
    const image = await loadImage('./src/public/beer background.png');

    // Create canvas with optimized dimensions (1920x1080 for Full HD)
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    // Calculate scaling to cover the canvas
    const scale = Math.max(1920 / image.width, 1080 / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (1920 - scaledWidth) / 2;
    const y = (1080 - scaledHeight) / 2;

    // Draw the image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Save as JPEG with quality 85
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
    fs.writeFileSync('./src/public/beer-background-optimized.jpg', buffer);

    console.log('Optimization complete!');
    console.log(`Original size: ${(fs.statSync('./src/public/beer background.png').size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Optimized size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

optimizeImage();
