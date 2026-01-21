import Link from 'next/link'

interface Category {
  id: number
  title?: string | null
  slug?: string | null
  parent?: Category | number | null
}

interface CategorySidebarProps {
  categories: Category[]
  currentSlug?: string
  basePath: string
  title: string
  allLabel: string
}

export function CategorySidebar({
  categories,
  currentSlug,
  basePath,
  title,
  allLabel,
}: CategorySidebarProps) {
  // Build hierarchy
  const rootCategories = categories.filter((cat) => !cat.parent)
  const childCategories = categories.filter((cat) => cat.parent)

  const getChildren = (parentId: number) => {
    return childCategories.filter((cat) => {
      const parent = cat.parent as Category | number | null
      return typeof parent === 'object' ? parent?.id === parentId : parent === parentId
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <nav>
        <ul className="space-y-1">
          <li>
            <Link
              href={basePath}
              className={`block px-3 py-2 rounded transition-colors ${
                !currentSlug
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {allLabel}
            </Link>
          </li>
          {rootCategories.map((category) => {
            const children = getChildren(category.id)
            const isActive = currentSlug === category.slug

            return (
              <li key={category.id}>
                <Link
                  href={`${basePath}?category=${category.slug}`}
                  className={`block px-3 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.title}
                </Link>
                {children.length > 0 && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {children.map((child) => {
                      const isChildActive = currentSlug === child.slug

                      return (
                        <li key={child.id}>
                          <Link
                            href={`${basePath}?category=${child.slug}`}
                            className={`block px-3 py-2 rounded text-sm transition-colors ${
                              isChildActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {child.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
