import * as React from 'react'

import {
  Link,
} from 'react-router-dom'

interface EMCategory {
  id?: string
  name: string
  path: string
}

export const EMViewCategoryList = (props: { prefix: string, categories: EMCategory[] }) => {
  if (!props.categories) return

  return (
    <section className='view-category-list'>
      <ul className='widget-nav-list'>
        {props.categories.map(({ id, name, path }) => (
          <li key={id}>
            <Link to={`${props.prefix}/${path}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
