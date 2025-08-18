import Markdown from 'markdown-to-jsx'

export default function BlogViewer({ post }: { post: { slug: string; meta: any; raw: string } | null }) {
  if (!post) return <div className="blog-viewer">Select a post</div>

  const body = post.raw.replace(/^---[\s\S]*?---\n?/, '')

  return (
    <article className="blog-viewer">
      <h1>{post.meta.title}</h1>
      <div className="meta">{post.meta.date} • {post.meta.tags?.join(', ')}</div>
      <section className="content">
        <Markdown>{body}</Markdown>
      </section>
    </article>
  )
}
