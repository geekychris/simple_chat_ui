const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const pngToIco = require('png-to-ico');

async function generateIcons() {
  const svgBuffer = await fs.readFile(path.join(__dirname, '../public/chat-icon.svg'));
  
  // Generate PNG icons
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/logo512.png'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/logo192.png'));

  // Generate favicon PNGs
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16x16.png'));

  // Create favicon.ico from the PNG files
  const pngBuffer = await pngToIco([
    path.join(__dirname, '../public/favicon-32x32.png'),
    path.join(__dirname, '../public/favicon-16x16.png')
  ]);

  await fs.writeFile(path.join(__dirname, '../public/favicon.ico'), pngBuffer);

  // Clean up temporary PNG files
  await fs.unlink(path.join(__dirname, '../public/favicon-32x32.png'));
  await fs.unlink(path.join(__dirname, '../public/favicon-16x16.png'));

  console.log('Generated all icons successfully!');
}

generateIcons().catch(console.error);

