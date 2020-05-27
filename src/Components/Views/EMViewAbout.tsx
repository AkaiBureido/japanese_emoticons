import * as React from 'react'
import { useRef, useEffect } from 'react'

import AboutPageHTML from 'self://Static/About.md'

export const EMAboutView = () => {
  let version = '?.?'
  if (typeof window._meta.version !== 'undefined') {
    version = window._meta.version
  }

  let ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      let links = ref.current.querySelectorAll('a')
      for (let i = 0; i < links.length; ++i) {
        links[i].target = '_blank'
      }
    }
  }, [ref])

  return (
    <section className='view-about-page' ref={ref}>
      <AboutPageHTML version={version} />
    </section>
  )
}
