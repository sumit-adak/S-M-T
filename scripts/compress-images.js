const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIRECTORIES = [
  path.join(__dirname, '../public/assets/portfolio'),
  path.join(__dirname, '../public/assets/projects'),
  path.join(__dirname, '../public/assets/skills')
];

const TARGET_FILES = [
  path.join(__dirname, '../public/assets/sumit-hero.png'),
  path.join(__dirname, '../public/assets/sumit-contact.png')
];

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    return; // Skip SVGs or other files
  }

  const outputDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(outputDir, `${baseName}.webp`);

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let pipeline = image;

    // Resize if width or height exceeds 2000px
    if (metadata.width > 2000 || metadata.height > 2000) {
      console.log(`Resizing large image: ${path.basename(filePath)} (${metadata.width}x${metadata.height})`);
      pipeline = pipeline.resize({
        width: metadata.width > metadata.height ? 2000 : undefined,
        height: metadata.height >= metadata.width ? 2000 : undefined,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP at 80% quality
    await pipeline
      .webp({ quality: 80 })
      .toFile(outputPath);

    const oldSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`Converted: ${path.basename(filePath)} -> ${baseName}.webp (${(oldSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`Error processing ${path.basename(filePath)}:`, err.message);
  }
}

async function run() {
  console.log('Starting image compression and WebP conversion...');

  // Process individual target files
  for (const file of TARGET_FILES) {
    if (fs.existsSync(file)) {
      await processImage(file);
    } else {
      console.warn(`File not found: ${file}`);
    }
  }

  // Process target directories
  for (const dir of TARGET_DIRECTORIES) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile()) {
        await processImage(fullPath);
      }
    }
  }

  console.log('Image compression completed!');
}

run();
