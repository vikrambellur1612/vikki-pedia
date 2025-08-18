import { useState } from 'react'
import './App.css'
import BlogList from './components/BlogList'
import { BlogModal } from './components/Modal'

function App() {
  const [view, setView] = useState<'list'|'archive'|'about'>('list')
  const [preview, setPreview] = useState<any | null>(null)

  return (
    <div id="app-root">
      <header className="site-header">
        <h1>Vikki-Pedia</h1>
        <p className="tagline">Personal blog archive — Discover insightful articles, tutorials, and thoughts. Click any card to read the full post.</p>
      </header>

      <main className="site-main">
        {view === 'list' && (
          <section className="home-content">
            <BlogList onSelect={(p) => setPreview(p)} onPreview={(p) => setPreview(p)} />
          </section>
        )}

        {view === 'archive' && (
          <section className="archive-content">
            <BlogList grouped onSelect={(p) => setPreview(p)} onPreview={(p) => setPreview(p)} />
          </section>
        )}

        {view === 'about' && (
          <section className="about-content">
            <div className="about card" style={{padding: '2rem'}}>
              <h2>About Vikki-Pedia</h2>
              <p>This is a modern, responsive archive of blog posts imported from the original Blogger site. Built with cutting-edge web technologies including Vite, React, and TypeScript.</p>
              <p>Features include:</p>
              <ul>
                <li>🔍 Advanced search and filtering capabilities</li>
                <li>🏷️ Tag-based organization system</li>
                <li>📱 Progressive Web App (PWA) for offline reading</li>
                <li>🎨 Modern, responsive design inspired by Minimalist Baker</li>
                <li>⚡ Fast, optimized performance with infinite scroll</li>
              </ul>
              <p>Install as a PWA when deployed on Netlify for the best reading experience!</p>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">© {new Date().getFullYear()} Vikki — Built with React + Vite</footer>

      {/* bottom navigation for mobile */}
      <nav className="bottom-navigation" aria-label="Primary">
        <button className={`nav-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} aria-label="List view">
          <span className="dot" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
          <span>List</span>
        </button>
        <button className={`nav-btn ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')} aria-label="Archive view">
          <span className="dot" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>
          <span>Archive</span>
        </button>
        <button className={`nav-btn ${view === 'about' ? 'active' : ''}`} onClick={() => setView('about')} aria-label="About">
          <span className="dot" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>About</span>
        </button>
      </nav>

      {preview && (
        <BlogModal 
          isOpen={!!preview}
          onClose={() => setPreview(null)}
          title={preview.meta.title || preview.slug}
          content={preview.raw}
        />
      )}
    </div>
  )
}

export default App
