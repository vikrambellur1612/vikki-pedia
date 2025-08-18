# Vikki-Pedia

A modern, responsive PWA blog archive built with Vite + React + TypeScript, featuring elegant design inspired by Minimalist Baker.

## ✨ Features

- **🎨 Modern Design**: Clean, professional layout with beautiful card-based blog listing
- **📱 Responsive PWA**: Works perfectly on desktop, tablet, and mobile devices
- **🔍 Advanced Search**: Full-text search with tag and year filtering
- **🖼️ Smart Images**: Automatic image matching with curated placeholder system
- **📖 Enhanced Reading**: Beautiful modal reader with markdown rendering
- **⚡ Performance**: Fast loading with infinite scroll and optimized assets
- **🏷️ Tag System**: Organized content with tag-based filtering
- **📅 Year Archive**: Browse posts by publication year
- **🎯 Clean UI**: Single header design with modern filter buttons

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with modern design system
- **Markdown**: markdown-to-jsx for rich content rendering
- **PWA**: Service Worker ready for offline functionality
- **Deployment**: Netlify optimized

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/vikrambellur1612/vikki-pedia.git
cd vikki-pedia
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── BlogList.tsx          # Main blog listing component
│   ├── BlogList.module.css   # Blog list styles
│   ├── BlogViewer.tsx        # Individual blog post viewer
│   └── Modal.tsx             # Modal component for blog previews
├── content/                  # Markdown blog posts
│   └── 2011/                 # Organized by year
├── App.tsx                   # Main application component
├── App.css                   # Global application styles
└── index.css                 # CSS variables and design system
```

## 🎨 Design System

The site uses a carefully crafted design system with:

- **Colors**: Coral primary (#ff9f7a) with cream backgrounds
- **Typography**: Modern font stack with proper hierarchy
- **Components**: Reusable CSS modules with consistent styling
- **Layout**: Mobile-first responsive design
- **Animations**: Subtle hover effects and smooth transitions

## 📝 Content Management

Blog posts are stored as Markdown files in the `content/` directory, organized by year. Each post includes frontmatter with:

```markdown
---
title: "Post Title"
date: "YYYY-MM-DD"
tags: [tag1, tag2, tag3]
---

Post content here...
```

## 🚀 Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on Git push

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🌟 Features in Detail

### Smart Image System
- Automatically matches blog posts with relevant images
- Falls back to contextually appropriate placeholders
- Optimized for web with proper sizing and compression

### Advanced Filtering
- Real-time search across post titles and content
- Tag-based filtering with modern button UI
- Year-based archive browsing
- Combined filters for precise content discovery

### PWA Capabilities
- Offline reading support
- Installable on mobile devices
- Fast loading with service worker caching
- Native app-like experience

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Vikram Bellur** - [GitHub](https://github.com/vikrambellur1612)

---

Built with ❤️ using modern web technologies
