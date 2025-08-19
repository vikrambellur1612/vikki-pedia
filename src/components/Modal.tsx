import React, { useEffect } from 'react'
import Markdown from 'markdown-to-jsx'

const CodeBlock = ({ children, className }: { children: string; className?: string }) => {
  const language = className?.replace('lang-', '') || '';
  return (
    <pre className={`code-block ${language}`}>
      <code>{children}</code>
    </pre>
  );
};

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  slug?: string;
}

export function BlogModal({ isOpen, onClose, title, content, slug }: BlogModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  const handleShare = async () => {
    const url = `${window.location.origin}/${slug || '#'}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this blog post: ${title}`,
          url: url,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.log('Error copying to clipboard:', err)
      }
    }
  }

  const handleSaveHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Vikki-Pedia</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .site-header {
            position: relative;
            height: 200px;
            overflow: hidden;
            margin-bottom: 2rem;
        }
        .header-bg {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .blog-title-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            z-index: 2;
        }
        .blog-title-overlay h1 {
            font-size: 2.5rem;
            margin: 0;
            font-weight: bold;
        }
        .blog-title-overlay p {
            font-size: 1.1rem;
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .content-wrapper {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 2rem 2rem 2rem;
        }
        .blog-content h1:first-child {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
            margin-top: 0;
        }
        .meta {
            color: #666;
            font-style: italic;
            margin-bottom: 2rem;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        blockquote {
            border-left: 4px solid #3498db;
            margin: 1rem 0;
            padding-left: 1rem;
            color: #666;
        }
        pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
        }
        @media (max-width: 768px) {
            .content-wrapper {
                padding: 0 1rem 1rem 1rem;
            }
            .blog-title-overlay h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <header class="site-header">
        <img src="${window.location.origin}/images/Header.jpg" alt="Vikki-Pedia Header" class="header-bg" />
        <div class="blog-title-overlay">
            <h1>Vikki-Pedia</h1>
            <p>My life, in my own words !!!!</p>
        </div>
    </header>
    <div class="content-wrapper">
        <div class="blog-content">
            ${document.querySelector('.blog-modal-body')?.innerHTML || ''}
        </div>
        <div class="footer">
            <p>Downloaded from Vikki-Pedia</p>
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null;

  const markdownOptions = {
    overrides: {
      code: {
        component: CodeBlock,
      },
      img: {
        props: {
          style: { maxWidth: '100%', height: 'auto', borderRadius: '8px' }
        }
      }
    },
  };

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="blog-modal-header">
          <h1 className="blog-modal-title">{title}</h1>
          <button className="blog-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="blog-modal-body">
          <Markdown options={markdownOptions}>{content}</Markdown>
          <div className="blog-modal-actions" style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '2rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #eee',
            justifyContent: 'center' 
          }}>
            <button 
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2980b9'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3498db'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            <button 
              onClick={handleSaveHTML}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#229954'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#27ae60'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Save HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
