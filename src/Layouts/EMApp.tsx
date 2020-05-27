import * as React from 'react'
import { ReactElement } from 'react'

import {
  useParams as useRouterParams,
  useHistory as useBrowserHistory,
} from 'react-router-dom'

import { getKaomojiListing, EMAppStorePayload } from 'self://Reducers/EMAppStore'
import { EMViewPage, EMViewSmileTable, EMSettingsView, EMViewCategoryList } from 'self://Components/Views'
import { EMAboutView } from 'self://Components/Views/EMViewAbout'

export type EMAppKind = 'category' | 'table' | 'about' | 'settings'

export const EMApp = (props: {
  kind: EMAppKind
  appState: EMAppStorePayload
}) => {
  let browser = {
    route: useRouterParams() as any,
    history: useBrowserHistory(),
  }

  let page: {
    title: string
    widgets?: {
      action: Function,
      hint: string,
      content: any,
    }[]
    body?: ReactElement
  } = { title: '', body: null }

  let widgetBackButton = {
    content: 'Back',
    hint: 'Go to the previous page',
    action: () => browser.history.goBack(),
  }
  let widgetAbout = {
    content: <i className="codicon codicon-question"/>,
    hint: 'About this extension',
    action: () => browser.history.push('/about'),
  }
  let widgetSettings = {
    content: <i className="codicon codicon-gear"/>,
    hint: 'Extension settings',
    action: () => browser.history.push('/settings'),
  }
  let widgetDetach = {
    content: <i className="codicon codicon-multiple-windows"/>,
    hint: 'Detach the extension',
    action: () =>
      chrome.windows.create({
        url: 'index.html',
        type: 'popup',
        width: 330,
        height: 550,
      }, function (w) {
        w.openner = "popup"
      }),
  }

  page.widgets = [widgetBackButton]
  if (browser.history.location.pathname === '/list') {
    page.widgets = [widgetAbout, widgetSettings]
    if (typeof chrome !== "undefined") {
      page.widgets.push(widgetDetach)
    }
  }

  if (!props.appState) {
    page.title = 'Loading...'
  } else if (props.kind === 'about') {
    page.title = 'About'
    page.body = <EMAboutView />
  } else if (props.kind === 'settings') {
    page.title = 'Settings'
    page.body = <EMSettingsView />
  } else if (props.kind === 'category') {
    let listing = getKaomojiListing(props.appState, browser.route)
    if (listing.name) {
      page.title = listing.name + ':'
    } else {
      page.title = 'Categories:'
    }
    page.body = <EMViewCategoryList categories={listing.content()} />
  } else if (props.kind === 'table') {
    let listing = getKaomojiListing(props.appState, browser.route)
    page.title = listing.name + ':'
    page.body = <EMViewSmileTable hash={listing.path} content={listing.data} />
  }

  return (
    <EMViewPage title={page.title} widget={widgetButton(page.widgets)}>
      {page.body}
    </EMViewPage>
  )
}

const widgetButton = (o?: { action: Function; hint: string; content: any }[]) => {
  if (!o) return
  return (
    <>
      {o.map(({ action, hint, content }, idx) => (
        <React.Fragment key={hint}>
          {idx > 0 ? ' ' : null}
          <a title={hint} className='button' href='#' onClick={() => action()}>
            {content}
          </a>
        </React.Fragment>
      ))}
    </>
  )
}
