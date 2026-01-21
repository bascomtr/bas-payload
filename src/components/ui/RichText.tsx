import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface RichTextProps {
  content: unknown
  className?: string
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null

  // Check if it's Lexical editor content
  const lexicalContent = content as SerializedEditorState | null

  if (lexicalContent?.root?.children) {
    return (
      <div className={`rich-text ${className}`}>
        {renderLexicalContent(lexicalContent.root.children)}
      </div>
    )
  }

  // Fallback for HTML string content
  if (typeof content === 'string') {
    return (
      <div
        className={`rich-text ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return null
}

interface LexicalNode {
  type: string
  tag?: string
  text?: string
  format?: number
  children?: LexicalNode[]
  url?: string
  src?: string
  alt?: string
  width?: number
  height?: number
  listType?: string
  value?: number
}

function renderLexicalContent(children: LexicalNode[]): React.ReactNode[] {
  return children.map((node, index) => {
    const key = `${node.type}-${index}`

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={key}>
            {node.children ? renderLexicalContent(node.children) : null}
          </p>
        )

      case 'heading':
        const tag = node.tag || 'h2'
        const headingContent = node.children ? renderLexicalContent(node.children) : null
        switch (tag) {
          case 'h1': return <h1 key={key}>{headingContent}</h1>
          case 'h2': return <h2 key={key}>{headingContent}</h2>
          case 'h3': return <h3 key={key}>{headingContent}</h3>
          case 'h4': return <h4 key={key}>{headingContent}</h4>
          case 'h5': return <h5 key={key}>{headingContent}</h5>
          case 'h6': return <h6 key={key}>{headingContent}</h6>
          default: return <h2 key={key}>{headingContent}</h2>
        }

      case 'text':
        let textContent: React.ReactNode = node.text || ''
        const format = node.format || 0

        // Apply text formatting
        if (format & 1) textContent = <strong>{textContent}</strong>
        if (format & 2) textContent = <em>{textContent}</em>
        if (format & 4) textContent = <s>{textContent}</s>
        if (format & 8) textContent = <u>{textContent}</u>
        if (format & 16) textContent = <code>{textContent}</code>

        return <span key={key}>{textContent}</span>

      case 'link':
        return (
          <a
            key={key}
            href={node.url || '#'}
            target={node.url?.startsWith('http') ? '_blank' : undefined}
            rel={node.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {node.children ? renderLexicalContent(node.children) : null}
          </a>
        )

      case 'list':
        const ListTag = node.listType === 'number' ? 'ol' : 'ul'
        return (
          <ListTag key={key}>
            {node.children ? renderLexicalContent(node.children) : null}
          </ListTag>
        )

      case 'listitem':
        return (
          <li key={key} value={node.value}>
            {node.children ? renderLexicalContent(node.children) : null}
          </li>
        )

      case 'quote':
        return (
          <blockquote key={key}>
            {node.children ? renderLexicalContent(node.children) : null}
          </blockquote>
        )

      case 'upload':
        if (node.src) {
          return (
            <figure key={key}>
              <img
                src={node.src}
                alt={node.alt || ''}
                width={node.width}
                height={node.height}
              />
            </figure>
          )
        }
        return null

      case 'linebreak':
        return <br key={key} />

      default:
        if (node.children) {
          return (
            <div key={key}>
              {renderLexicalContent(node.children)}
            </div>
          )
        }
        return null
    }
  })
}
