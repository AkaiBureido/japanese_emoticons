import * as React from 'react'
import { useRef, useEffect } from 'react'

import AboutPageHTML from 'JEM/views/static/about.md'


function getAppVersion(): string {
  let version = '?.?'

  try {
    if (window._meta.version !== undefined) {
      version = window._meta.version
    }
  } catch {}

  return version
}

export const EMAboutPage = () => {
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
      <AboutPageHTML version={getAppVersion()} />
    </section>
  )
}
