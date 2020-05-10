import * as React from 'react'

import {
  useParams as useRouterParams,
  useHistory as useBrowserHistory,
} from 'react-router-dom'
import { getKaomojiListing, KaomojiStorePayload } from 'self://Reducers/KaomojiStore'
import { EMViewPage, EMViewSmileTable, EMViewCategoryList } from 'self://Components/Views'
import { ReactElement } from 'react'
import { EMAboutView } from 'self://Components/Views/EMViewAbout'
import { EMSettingsView } from 'self://Components/Views/EMViewSettings'

export type EMAppKind = 'category' | 'table' | 'about' | 'settings'

export const EMApp = (props: {
  kind: EMAppKind
  kaomojiListing: KaomojiStorePayload
}) => {
  let browser = {
    route: useRouterParams() as any,
    history: useBrowserHistory(),
  }

  let page: {
    title: string
    widgets?: {
      action: Function
      content: string
    }[]
    body?: ReactElement
  } = { title: '', body: null }

  let widgetBackButton = {
    content: 'Back',
    action: () => browser.history.goBack(),
  }
  let widgetAbout = {
    content: '?',
    action: () => browser.history.push('/about'),
  }
  let widgetSettings = {
    content: '#',
    action: () => browser.history.push('/settings'),
  }

  page.widgets = [widgetBackButton]
  if (browser.history.location.pathname === '/list') {
    page.widgets = [widgetAbout, widgetSettings]
  }

  if (!props.kaomojiListing) {
    page.title = 'Loading...'
  } else if (props.kind === 'about') {
    page.title = 'About'
    page.body = <EMAboutView />
  } else if (props.kind === 'settings') {
    page.title = 'Settings'
    page.body = <EMSettingsView />
  } else if (props.kind === 'category') {
    let listing = getKaomojiListing(props.kaomojiListing, browser.route)
    if (listing.name) {
      page.title = listing.name + ':'
    } else {
      page.title = 'Categories:'
    }
    page.body = <EMViewCategoryList categories={listing.content()} />
  } else if (props.kind === 'table') {
    let listing = getKaomojiListing(props.kaomojiListing, browser.route)
    page.title = listing.name + ':'
    page.body = <EMViewSmileTable hash={listing.path} content={listing.data} />
  }

  return (
    <EMViewPage title={page.title} widget={widgetButton(page.widgets)}>
      {page.body}
    </EMViewPage>
  )
}

const widgetButton = (o?: { action: Function; content: any }[]) => {
  if (!o) return
  return (
    <>
      {o.map(({ action, content }, idx) => (
        <React.Fragment key={content}>
          {idx > 0 ? ' ' : null}
          <a className='button' href='#' onClick={() => action()}>
            {content}
          </a>
        </React.Fragment>
      ))}
    </>
  )
}
