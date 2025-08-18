import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Images found from the blog
const imageUrls = [
  {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgRA8dhT7upqbPvD5KU9u6_Byp7ASRGjgqNsDfrpQAaAIOwxPbCeKdbjD0SJtd1HqxOOGHyapgJSYvIspCfc9FPujG3ZuO6qJWww9zB9r-k07Dzc_I4MT5_a4GVCkagCqpTKS_z-EVcmGtp/s1600/auto.jpg',
    filename: 'green-auto.jpg',
    postSlug: 'green-auto'
  },
  {
    url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhqbmyMUo6ML37_6g-tOGCf27aOoyzE0UIJLtZ4xYo7putYRscYMp8doZHC8RnKz2EteqbUD-We19g_6OckZMQvxcT-WfIDuNuY-0eJz2iXZQd6NICZlk0bzZyz3SeGmUfWu_QVwp9uKwt/s1600/India-Pak+match.JPG',
    filename: 'india-pak-match.jpg', 
    postSlug: 'war-that-we-won'
  }
];

// Placeholder images for different categories
const placeholderImages = [
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop&crop=center', // Tech/Coding
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center', // Writing/Blog
  'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=300&fit=crop&crop=center', // Sports
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=center', // City/Bangalore
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&crop=center', // News/World
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center', // Travel
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&crop=center', // Food
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center', // Books/Reading
];

// Create public/images directory if it doesn't exist
const imagesDir = path.join(path.dirname(__dirname), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Download function
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
      } else {
        console.error(`Failed to download ${url}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err);
      reject(err);
    });
  });
}

async function downloadImages() {
  console.log('Starting image download...');
  
  // Download actual blog images
  for (const img of imageUrls) {
    const filepath = path.join(imagesDir, img.filename);
    try {
      await downloadImage(img.url, filepath);
    } catch (error) {
      console.error(`Failed to download ${img.filename}:`, error);
    }
  }
  
  // Download placeholder images
  for (let i = 0; i < placeholderImages.length; i++) {
    const url = placeholderImages[i];
    const filepath = path.join(imagesDir, `placeholder-${i + 1}.jpg`);
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`Failed to download placeholder-${i + 1}.jpg:`, error);
    }
  }
  
  console.log('Image download completed!');
}

downloadImages().catch(console.error);
