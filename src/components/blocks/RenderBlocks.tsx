import { type Locale } from '@/i18n/config'

interface Block {
  blockType: string
  [key: string]: unknown
}

interface RenderBlocksProps {
  blocks: Block[]
  locale: Locale
}

export function RenderBlocks({ blocks, locale }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = `block-${index}`

        switch (block.blockType) {
          case 'hero':
            return <HeroBlockComponent key={key} block={block} locale={locale} />
          case 'content':
            return <ContentBlockComponent key={key} block={block} locale={locale} />
          case 'cta':
            return <CTABlockComponent key={key} block={block} locale={locale} />
          case 'gallery':
            return <GalleryBlockComponent key={key} block={block} locale={locale} />
          case 'stats':
            return <StatsBlockComponent key={key} block={block} locale={locale} />
          case 'timeline':
            return <TimelineBlockComponent key={key} block={block} locale={locale} />
          case 'testimonials':
            return <TestimonialsBlockComponent key={key} block={block} locale={locale} />
          case 'productGrid':
            return <ProductGridBlockComponent key={key} block={block} locale={locale} />
          default:
            return null
        }
      })}
    </>
  )
}

// Block Components
function HeroBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, subheading, backgroundImage, buttons, height, textAlign } = block as {
    heading?: string
    subheading?: string
    backgroundImage?: { url?: string }
    buttons?: Array<{ label?: string; link?: string; variant?: string }>
    height?: string
    textAlign?: string
  }

  const heightClass = {
    full: 'min-h-screen',
    large: 'min-h-[600px]',
    medium: 'min-h-[400px]',
  }[height || 'large']

  return (
    <section
      className={`hero ${heightClass}`}
      style={{
        backgroundImage: backgroundImage?.url
          ? `url(${backgroundImage.url})`
          : undefined,
      }}
    >
      <div className="hero-overlay" />
      <div className={`hero-content text-${textAlign || 'center'}`}>
        <div className="container">
          {heading && <h1 className="text-4xl lg:text-6xl font-bold mb-4">{heading}</h1>}
          {subheading && <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto">{subheading}</p>}
          {buttons && buttons.length > 0 && (
            <div className="flex gap-4 justify-center">
              {buttons.map((button, index) => (
                <a
                  key={index}
                  href={button.link || '#'}
                  className={`btn btn-${button.variant || 'primary'}`}
                >
                  {button.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ContentBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { contentItems, backgroundColor, paddingTop, paddingBottom } = block as {
    contentItems?: Array<{ content?: unknown }>
    backgroundColor?: string
    paddingTop?: string
    paddingBottom?: string
  }

  const bgClass = {
    white: 'bg-white',
    lightGray: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary text-white',
  }[backgroundColor || 'white']

  const ptClass = {
    none: 'pt-0',
    small: 'pt-8',
    medium: 'pt-16',
    large: 'pt-24',
  }[paddingTop || 'medium']

  const pbClass = {
    none: 'pb-0',
    small: 'pb-8',
    medium: 'pb-16',
    large: 'pb-24',
  }[paddingBottom || 'medium']

  return (
    <section className={`${bgClass} ${ptClass} ${pbClass}`}>
      <div className="container">
        <div className="rich-text max-w-4xl mx-auto">
          {contentItems?.map((item, index) => (
            <div key={index}>
              {/* Content would be rendered here with RichText component */}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTABlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, description, buttons, backgroundColor } = block as {
    heading?: string
    description?: string
    buttons?: Array<{ label?: string; link?: string; variant?: string }>
    backgroundColor?: string
  }

  const bgClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    dark: 'bg-gray-900',
    light: 'bg-gray-100',
  }[backgroundColor || 'primary']

  const textClass = ['primary', 'secondary', 'dark'].includes(backgroundColor || 'primary')
    ? 'text-white'
    : 'text-gray-900'

  return (
    <section className={`section ${bgClass} ${textClass}`}>
      <div className="container text-center">
        {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
        {description && <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">{description}</p>}
        {buttons && buttons.length > 0 && (
          <div className="flex gap-4 justify-center">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.link || '#'}
                className={`btn ${
                  textClass === 'text-white' ? 'btn-outline text-white border-white' : 'btn-primary'
                }`}
              >
                {button.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function GalleryBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, images, columns } = block as {
    heading?: string
    images?: Array<{ image?: { url?: string }; caption?: string }>
    columns?: string
  }

  const gridClass = {
    '2': 'grid-2',
    '3': 'grid-3',
    '4': 'grid-4',
    '5': 'grid grid-cols-5 gap-4',
  }[columns || '3']

  return (
    <section className="section">
      <div className="container">
        {heading && <h2 className="text-2xl font-bold mb-8">{heading}</h2>}
        <div className={gridClass}>
          {images?.map((item, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              {item.image?.url && (
                <img
                  src={item.image.url}
                  alt={item.caption || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, stats } = block as {
    heading?: string
    stats?: Array<{ value?: string; label?: string; description?: string }>
  }

  return (
    <section className="section bg-gray-900 text-white">
      <div className="container">
        {heading && <h2 className="text-2xl font-bold mb-12 text-center">{heading}</h2>}
        <div className="grid-4 text-center">
          {stats?.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-medium">{stat.label}</div>
              {stat.description && (
                <div className="text-sm text-gray-400 mt-1">{stat.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, items } = block as {
    heading?: string
    items?: Array<{ year?: string; title?: string; description?: string }>
  }

  return (
    <section className="section">
      <div className="container">
        {heading && <h2 className="text-2xl font-bold mb-12 text-center">{heading}</h2>}
        <div className="max-w-3xl mx-auto">
          {items?.map((item, index) => (
            <div key={index} className="flex gap-4 mb-8">
              <div className="w-24 flex-shrink-0 text-right">
                <span className="text-2xl font-bold text-primary">{item.year}</span>
              </div>
              <div className="flex-grow border-l-2 border-primary pl-4 pb-8">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsBlockComponent({ block }: { block: Block; locale: Locale }) {
  const { heading, testimonials } = block as {
    heading?: string
    testimonials?: Array<{
      quote?: string
      author?: string
      position?: string
      company?: string
    }>
  }

  return (
    <section className="section bg-gray-50">
      <div className="container">
        {heading && <h2 className="text-2xl font-bold mb-12 text-center">{heading}</h2>}
        <div className="grid-3">
          {testimonials?.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <blockquote className="text-gray-700 mb-4">&ldquo;{item.quote}&rdquo;</blockquote>
              <div>
                <div className="font-semibold">{item.author}</div>
                {item.position && (
                  <div className="text-sm text-gray-500">
                    {item.position}
                    {item.company && `, ${item.company}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductGridBlockComponent({ block }: { block: Block; locale: Locale }) {
  // This would fetch products dynamically based on block settings
  // For now, just render a placeholder
  const { heading } = block as { heading?: string }

  return (
    <section className="section">
      <div className="container">
        {heading && <h2 className="text-2xl font-bold mb-8">{heading}</h2>}
        <div className="grid-3">
          {/* Products would be rendered here */}
        </div>
      </div>
    </section>
  )
}
