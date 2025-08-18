import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './BlogList.module.css';

type Meta = { title?: string; date?: string; tags?: string[] }

type PostItem = { slug: string; meta: Meta; raw: string; thumb?: string }

export default function BlogList({ onSelect, onPreview, grouped = false, compact = false }: { onSelect: (post: PostItem) => void; onPreview?: (post: PostItem) => void; grouped?: boolean; compact?: boolean }) {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)

  // UI state for filtering and search
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState('')

  // pagination / infinite scroll
  const PAGE = 12
  const [page, setPage] = useState(1)
  const sentinel = useRef<HTMLDivElement | null>(null)
  const tagDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setTagDropdownOpen(false)
      }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && tagDropdownOpen) {
        setTagDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [tagDropdownOpen])

  useEffect(() => {
    const modules = import.meta.glob('/content/**/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>

    async function load() {
      const entries = Object.entries(modules)
      const results: PostItem[] = []

      for (const [path, loader] of entries) {
        try {
          const raw = await loader()
          const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/) // simple frontmatter
          const meta: Meta = {}
          if (fmMatch) {
            const yaml = fmMatch[1]
            for (const line of yaml.split(/\r?\n/)) {
              const [k, ...rest] = line.split(':')
              if (!k) continue
              const key = k.trim()
              const value = rest.join(':').trim()
              if (key === 'title') meta.title = value.replace(/"/g, '')
              if (key === 'date') meta.date = value.replace(/"/g, '')
              if (key === 'tags') {
                const t = value.replace(/\[|\]|\"/g, '').trim()
                meta.tags = t ? t.split(',').map(s => s.trim()) : []
              }
            }
          }
          const slug = path.split('/').pop()!.replace(/\.md$/, '')
          // extract first image from markdown for thumbnail or assign smart placeholder
          const body = removeFrontmatter(raw)
          const imgMatch = body.match(/!\[.*?\]\((.*?)\)/)
          let thumb = imgMatch ? imgMatch[1] : undefined
          
          // If no image in markdown, assign smart placeholder based on post content and slug
          if (!thumb) {
            thumb = getSmartThumbnail(slug, body, meta.title || '', meta.tags || [])
          }
          results.push({ slug, meta, raw, thumb })
        } catch (err) {
          console.error('failed to load', path, err)
        }
      }

      results.sort((a, b) => {
        const da = a.meta.date ? Date.parse(a.meta.date) : 0
        const db = b.meta.date ? Date.parse(b.meta.date) : 0
        return db - da
      })

      setPosts(results)
      setLoading(false)
    }

    load()
  }, [])

  const tags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.meta.tags ?? []))).sort(), [posts])
  const years = useMemo(() => Array.from(new Set(posts.map(p => p.meta.date ? new Date(p.meta.date).getFullYear().toString() : ''))).filter(Boolean).sort((a, b) => b.localeCompare(a)), [posts])
  
  // Filter tags based on search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return tags
    return tags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
  }, [tags, tagSearchQuery])

  const filtered = useMemo(() => {
    let list = posts.slice()
    if (selectedTags.length > 0) {
      list = list.filter(p => selectedTags.some(tag => (p.meta.tags ?? []).includes(tag)))
    }
    if (selectedYear) list = list.filter(p => p.meta.date && new Date(p.meta.date).getFullYear().toString() === selectedYear)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(p => {
        const title = (p.meta.title ?? p.slug).toLowerCase()
        const body = removeFrontmatter(p.raw).toLowerCase()
        return title.includes(q) || body.includes(q)
      })
    }
    list.sort((a, b) => {
      const da = a.meta.date ? Date.parse(a.meta.date) : 0
      const db = b.meta.date ? Date.parse(b.meta.date) : 0
      return sortAsc ? da - db : db - da
    })
    return list
  }, [posts, selectedTags, selectedYear, query, sortAsc])

  // grouped by year
  const groupedByYear = useMemo(() => {
    const map: Record<string, PostItem[]> = {}
    for (const p of filtered) {
      const y = p.meta.date ? new Date(p.meta.date).getFullYear().toString() : 'Unknown'
      if (!map[y]) map[y] = []
      map[y].push(p)
    }
    return map
  }, [filtered])

  // slice for pagination
  const paged = useMemo(() => filtered.slice(0, page * PAGE), [filtered, page])

  // intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinel.current) return
    const io = new IntersectionObserver(entries => {
      for (const ent of entries) {
        if (ent.isIntersecting) {
          setPage(p => p + 1)
        }
      }
    })
    io.observe(sentinel.current)
    return () => io.disconnect()
  }, [sentinel.current])

  if (loading) return <div className={`${styles.blogList} ${compact ? styles.compact : ''}`}>Loading posts…</div>

  function handleClick(post: PostItem) {
    if (onPreview) onPreview(post)
    else onSelect(post)
  }

  return (
    <div className={`${styles.blogList} ${compact ? styles.compact : ''}`}>
      <div className={styles.controls}>
        <input className={`${styles.search}`} aria-label="Search posts" placeholder="Search title or content" value={query} onChange={e => setQuery(e.target.value)} />
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Tags</label>
            <div className={styles.tagDropdown} ref={tagDropdownRef}>
              <button 
                className={`${styles.tagDropdownButton} ${selectedTags.length > 0 ? styles.active : ''}`}
                onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
              >
                {selectedTags.length === 0 
                  ? 'Select tags...' 
                  : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                }
                <span className={styles.dropdownArrow}>{tagDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {tagDropdownOpen && (
                <div className={styles.tagDropdownMenu}>
                  <div className={styles.tagDropdownHeader}>
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className={styles.tagSearchInput}
                    />
                    <div className={styles.tagHeaderActions}>
                      <button 
                        className={styles.clearAllTags} 
                        onClick={() => setSelectedTags([])}
                        disabled={selectedTags.length === 0}
                      >
                        Clear All
                      </button>
                      <span className={styles.tagCount}>{filteredTags.length} of {tags.length} tags</span>
                    </div>
                  </div>
                  <div className={styles.tagDropdownContent}>
                    {filteredTags.length === 0 ? (
                      <div className={styles.noTagsFound}>No tags found</div>
                    ) : (
                      filteredTags.map(tag => (
                        <label key={tag} className={styles.tagCheckbox}>
                          <input 
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag])
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag))
                              }
                            }}
                          />
                          <span className={styles.tagCheckboxLabel}>{tag}</span>
                          <span className={styles.tagCount}>
                            {posts.filter(p => (p.meta.tags ?? []).includes(tag)).length}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className={styles.selectedTagsPreview}>
                {selectedTags.map(tag => (
                  <span key={tag} className={styles.selectedTag}>
                    {tag}
                    <button 
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles.filterGroup}>
            <label>Year</label>
            <div className={styles.yearList}>
              <button 
                className={`${styles.toggleBtn} ${selectedYear === null ? styles.active : ''}`} 
                onClick={() => setSelectedYear(null)}
              >
                All
              </button>
              {years.map(y => (
                <button 
                  key={y} 
                  className={`${styles.toggleBtn} ${selectedYear === y ? styles.active : ''}`} 
                  onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterActions}>
            <button className="secondary-btn" onClick={() => { setQuery(''); setSelectedTags([]); setSelectedYear(null); }}>Clear</button>
            <button className="primary-btn" onClick={() => setSortAsc(s => !s)}>{sortAsc ? 'Oldest' : 'Newest'}</button>
          </div>
        </div>
      </div>

      {grouped ? (
        Object.entries(groupedByYear).map(([year, items]) => (
          <section key={year} className={styles.yearGroup}>
            <h4 className={styles.yearHeading}>{year}</h4>
            <div className={`${styles.yearList} ${styles.postGrid}`}>
              {items.slice(0, page * PAGE).map(post => (
                <article key={post.slug} className={styles.postCard} onClick={() => handleClick(post)}>
                  <div className={styles.postHero} style={{ backgroundImage: post.thumb ? `url(${post.thumb})` : undefined }} aria-hidden />
                  <div className={styles.postBody}>
                    <h3>{post.meta.title ?? post.slug}</h3>
                    <div className={styles.meta}>{post.meta.date}</div>
                    {post.meta.tags && (
                      <div className={styles.tags}>{post.meta.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}</div>
                    )}
                    <p className={styles.excerpt}>{getExcerpt(post.raw)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className={styles.postGrid}>
          {paged.map(post => (
            <article key={post.slug} className={styles.postCard} onClick={() => handleClick(post)}>
              <div className={styles.postHero} style={{ backgroundImage: post.thumb ? `url(${post.thumb})` : undefined }} aria-hidden />
              <div className={styles.postBody}>
                <h3>{post.meta.title ?? post.slug}</h3>
                <div className={styles.meta}>{post.meta.date}</div>
                {post.meta.tags && (
                  <div className={styles.tags}>{post.meta.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}</div>
                )}
                <p className={styles.excerpt}>{getExcerpt(post.raw)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div ref={sentinel} className={styles.sentinel} />
      <div className={styles.loadMore}>
        {paged.length < filtered.length ? <button className="primary-btn" onClick={() => setPage(p => p + 1)}>Load more</button> : <span>End of posts</span>}
      </div>
    </div>
  )
}

// Helper function to remove frontmatter consistently
function removeFrontmatter(raw: string): string {
  // Remove frontmatter more reliably
  let body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '') // Remove YAML frontmatter
  
  // If frontmatter removal didn't work, try alternative pattern
  if (body.startsWith('---')) {
    const lines = body.split('\n')
    let endIndex = -1
    
    // Find the end of frontmatter
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i
        break
      }
    }
    
    if (endIndex > 0) {
      body = lines.slice(endIndex + 1).join('\n')
    }
  }
  
  return body
}

function getExcerpt(raw: string) {
  // Remove frontmatter
  const body = removeFrontmatter(raw)
  
  // Clean markdown syntax
  let text = body
    .replace(/#+\s+/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/`(.*?)`/g, '$1') // Remove inline code markers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace links with just the text
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/>\s+/g, '') // Remove blockquote markers
    .replace(/^\s*[-*+]\s+/gm, '') // Remove unordered list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove ordered list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  return text.slice(0, 200) + (text.length > 200 ? '…' : '')
}

// Smart thumbnail assignment based on content analysis
function getSmartThumbnail(slug: string, body: string, title: string, tags: string[]): string {
  const content = (body + ' ' + title + ' ' + tags.join(' ')).toLowerCase()
  
  // Known blog images mapping
  const knownImages: { [key: string]: string } = {
    'green-auto': '/images/green-auto.jpg',
    'war-that-we-won': '/images/india-pak-match.jpg',
    'gemini-circus': '/images/circus-placeholder.jpg',
    'summer-holidays': '/images/summer-holidays.jpg',
    'sound-ok-horn': '/images/bangalore-traffic.jpg',
    'manohsipcig': '/images/writing-child.jpg',
    'words': '/images/writing-child.jpg',
    'bharat-sangeet-utsav': '/images/classical-music.jpg'
  }
  
  // Check if we have a specific image for this post
  if (knownImages[slug]) {
    return knownImages[slug]
  }
  
  // Smart placeholder selection based on content keywords
  if (content.includes('cricket') || content.includes('sport') || content.includes('match') || content.includes('world cup')) {
    return '/images/placeholder-3.jpg' // Sports
  }
  
  if (content.includes('bangalore') || content.includes('bengaluru') || content.includes('city') || content.includes('traffic')) {
    return '/images/placeholder-4.jpg' // City/Bangalore
  }
  
  if (content.includes('code') || content.includes('programming') || content.includes('tech') || content.includes('software')) {
    return '/images/placeholder-1.jpg' // Tech/Coding
  }
  
  if (content.includes('travel') || content.includes('trip') || content.includes('vacation') || content.includes('holiday')) {
    return '/images/placeholder-6.jpg' // Travel
  }
  
  if (content.includes('food') || content.includes('restaurant') || content.includes('hotel') || content.includes('sagar')) {
    return '/images/placeholder-7.jpg' // Food
  }
  
  if (content.includes('book') || content.includes('read') || content.includes('author') || content.includes('story')) {
    return '/images/placeholder-8.jpg' // Books/Reading
  }
  
  if (content.includes('news') || content.includes('world') || content.includes('politics') || content.includes('government')) {
    return '/images/placeholder-5.jpg' // News/World
  }
  
  // Default to writing/blog placeholder
  return '/images/placeholder-2.jpg' // Writing/Blog
}
