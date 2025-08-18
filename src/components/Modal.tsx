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
}

export function BlogModal({ isOpen, onClose, title, content }: BlogModalProps) {
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
