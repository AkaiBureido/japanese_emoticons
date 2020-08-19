import * as React from 'react'
import { ReactElement, Fragment, useEffect } from 'react'

import { Switch, Route, Redirect, RouteComponentProps } from 'react-router'

import {
  MemoryRouter as Router,
  useHistory as useRouterHistory,
} from 'react-router-dom'

import { WidgetSpec, EMViewPage } from 'JEM/views/ViewPage'

import { createSettingsProvider, useSettingsContext } from 'JEM/store/settings'

import {
  useEmojiStore,
  emojisAtPathFromStore,
  emojiCategoryContent,
} from 'JEM/store/emoji'

import {
  EMAboutPage,
  EMSettingsPage,
  EMViewCategoryList,
  EMViewSmileTable,
} from 'JEM/views/pages'

import { Metrics } from 'JEM/utils/metrics'

import * as styles_new from 'JEM/styles.less'
import * as styles_old from 'JEM/styles-old.less'

// =============================================================================

type RouterHistory = ReturnType<typeof useRouterHistory>
type HistoryLocation = Parameters<Parameters<RouterHistory['listen']>[0]>[0]

// =============================================================================

const EMSettingsProvider = createSettingsProvider()

const EMHistoryHook = (props: { children: ReactElement }) => {
  let history = useRouterHistory()

  console.log('HIST', history)

  useEffect(() => {
    historyTrackPage(history.location, 'LOAD')
    return history.listen((location, action) => {
      historyTrackPage(location, action)
    })
  }, [history])

  return <Fragment>{props.children}</Fragment>
}

const App = () => (
  <EMSettingsProvider>
    <Router>
      <EMHistoryHook>
        <Route component={AppRoutes} />
      </EMHistoryHook>
    </Router>
  </EMSettingsProvider>
)

const AppRoutes = ({ match, history }: RouteComponentProps) => {
  let widgets = [widgetBackButton(history)]

  // Set up CSS Styles.
  useCSSStyles()

  // let routes: [string, EMAppKind][] = [
  //   ['/about', 'about'],
  //   ['/settings', 'settings'],
  //   ['/list/:category/:subcategory/', 'table'],
  //   ['/list/:category/', 'category'],
  //   ['/list', 'category'],
  // ]

  return (
    <Switch>
      // About Page:
      <Route path='/about'>
        <EMViewPage title='About' widgets={widgets}>
          <EMAboutPage />
        </EMViewPage>
      </Route>
      // Settings Page:
      <Route path='/settings'>
        <EMViewPage title='About' widgets={widgets}>
          <EMSettingsPage />
        </EMViewPage>
      </Route>
      // Listing Pages:
      <Route path='/list' component={ListRoutes} />
      // Default:
      <Route>
        <Redirect to={'/list'} />
      </Route>
    </Switch>
  )
}

const ListRoutes = ({ match, history, location }: RouteComponentProps) => {
  let widgets = [newWidgetDetatchButton(), widgetAbout(history), widgetSettings(history)]
  // let widgets = []
  if ((history as any).index > 0) {
    widgets.push(widgetBackButton(history))
  }

  // Load the data.
  const appStore = useEmojiStore()
  useEffect(appStore.loadState, [])

  // Parse the current offset path.
  let prefix = match.url
  let path = location.pathname.substr(prefix.length)
  let spath = splitPath(path)

  console.log('OBJ', path, prefix)

  // If App is not initialized show loading screen.
  if (!appStore.state.initialized || appStore.state.loading) {
    return <EMViewPage title='Loading...' widgets={widgets} />
  }

  // Fetch Emoji Listing:
  let listing = emojisAtPathFromStore(appStore.state, spath)
  let title = listing.name ? `${listing.name}:` : 'Categories:'
  let content = emojiCategoryContent(listing)

  console.log('LST', listing)

  if (content) {
    return (
      <EMViewPage title={title} widgets={widgets}>
        <EMViewCategoryList prefix={prefix} categories={content} />
      </EMViewPage>
    )
  }
  return (
    <EMViewPage title={title} widgets={widgets}>
      <EMViewSmileTable hash={listing.path} content={listing.data} />
    </EMViewPage>
  )
}

function widgetBackButton(history: RouterHistory): WidgetSpec {
  return {
    content: 'Back',
    hint: 'Go to the previous page',
    action: () => history.goBack(),
  }
}

function widgetAbout(history: RouterHistory): WidgetSpec {
  return {
    content: <i className='codicon codicon-question' />,
    hint: 'About this extension',
    action: () => history.push('/about'),
  }
}

function widgetSettings(history: RouterHistory): WidgetSpec {
  return {
    content: <i className='codicon codicon-gear' />,
    hint: 'Extension settings',
    action: () => history.push('/settings'),
  }
}

function newWidgetDetatchButton(): WidgetSpec {
  return {
    content: <i className='codicon codicon-multiple-windows' />,
    hint: 'Detach the extension',
    action: () =>
      chrome.windows.create(
        {
          url: 'index.html',
          type: 'popup',
          width: 330,
          height: 550,
        },
        function (w) {
          w.openner = 'popup'
        },
      ),
  }
}

function useCSSStyles() {
  let { settings } = useSettingsContext()

  useEffect(() => {
    let head = document.querySelector('head')
    let globalStyle = document.querySelector('style[data-style]')

    if (globalStyle) {
      head.removeChild(globalStyle)
      if (styles_old.loaded) {
        styles_old.unuse()
        styles_old.loaded = false
      }
      if (styles_new.loaded) {
        styles_new.unuse()
        styles_new.loaded = false
      }
    }

    if (settings.oldStyle) {
      styles_old.use()
      styles_old.loaded = true
    } else {
      styles_new.use()
      styles_new.loaded = true
    }
  }, [settings])
}

function historyTrackPage(location: HistoryLocation, action: string) {
  if (action === 'PUSH' || action === 'LOAD') {
    Metrics.pageview(location.pathname)
  }
}

function splitPath(path: string): string[] {
  let path_components = path.split('/')
  if (path_components[0] === '') {
    path_components.splice(0, 1)
  }
  return path_components
}

export default App
