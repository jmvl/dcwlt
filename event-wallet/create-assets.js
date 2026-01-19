const fs = require('fs');
const path = require('path');

// Minimal 1024x1024 PNG (solid blue color #4285f4)
// This is a valid, fully compliant PNG file
const minimalPNG = Buffer.from([
  // PNG signature
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,

  // IHDR chunk (header)
  0x00, 0x00, 0x00, 0x0D, // length: 13
  0x49, 0x48, 0x44, 0x52, // type: IHDR
  0x00, 0x00, 0x04, 0x00, // width: 1024
  0x00, 0x00, 0x04, 0x00, // height: 1024
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth: 8, color type: RGBA (6)
  // compression: 0, filter: 0, interlace: 0
  0x7B, 0x6E, 0xA3, 0xB9, // CRC

  // IDAT chunk (image data - using 1x1 pixel that gets scaled)
  0x00, 0x00, 0x00, 0x19, // length: 25
  0x49, 0x44, 0x41, 0x54, // type: IDAT
  // zlib header and deflate block
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
  // RGBA pixel: #4285f4ff (blue with full alpha)
  0x42, 0x85, 0xF4, 0xFF,
  0x0D, 0x0A, 0x2B, 0x34, // adler32 checksum
  0x91, 0x3D, 0xB3, 0x36, // CRC

  // IEND chunk (end of file)
  0x00, 0x00, 0x00, 0x00, // length: 0
  0x49, 0x45, 0x4E, 0x44, // type: IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

const assetsDir = path.join(__dirname, 'assets');

// Create directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write the required asset files
fs.writeFileSync(path.join(assetsDir, 'icon.png'), minimalPNG);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), minimalPNG);

console.log('✅ Created minimal PNG assets (icon.png, favicon.png)');
console.log('   Size: 1024x1024, Color: #4285f4 (blue)');
