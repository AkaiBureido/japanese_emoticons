import * as React from 'react'

import { EMWidgetButton } from 'self://Components/EMWidgetButton'

interface EMCategory {
  id?: string
  name: string
  path: string
}

export const EMViewCategoryList = (props: { categories: EMCategory[] }) => {
  if (!props.categories) return

  return (
    <section className='view-category-list'>
      <ul className="widget-nav-list">
        {props.categories.map(({ id, name, path }) => (
          <li key={id}>
            <EMWidgetButton name={name} path={path} />
          </li>
        ))}
      </ul>
    </section>
  )
}
