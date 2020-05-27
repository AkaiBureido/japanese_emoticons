import * as React from 'react'

import { ReactElement, useCallback, useEffect } from 'react'
import { MemoryRouter as Router, useHistory } from 'react-router-dom'
import { Switch, Route, Redirect } from 'react-router'

import { EMApp, EMAppKind } from 'self://Layouts/EMApp'
import { EMSettings, EMSettingsProvider, useSettings } from 'self://Components/EMSettings'
import { Metrics } from 'self://Utils/Metrics'
import { useAppStore as useAppStore } from 'self://Reducers/EMAppStore'

import * as styles_old from "self://index-old.less";
import * as styles_new from "self://index.less";

type HLocation = Parameters<Parameters<ReturnType<typeof useHistory>['listen']>[0]>[0]

const useCSSStyles = (settings: EMSettings) => {
  useEffect(() => {
    let head = document.querySelector("head")
    let globalStyle = document.querySelector("style[data-style]")

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
    }
    else {
      styles_new.use()
      styles_new.loaded = true
    }
  }, [settings])
}

const HistoryHook = (props: { children: ReactElement }) => {
  let history = useHistory()
  let settings = useSettings()

  useCSSStyles(settings)

  let trackPage = useCallback((location: HLocation, action: string) => {
    if (action === 'PUSH' || action === 'LOAD') {
      Metrics.pageview(location.pathname)
    }
  }, [])

  useEffect(() => {
    trackPage(history.location, 'LOAD')
    return history.listen((location, action) => {
      trackPage(location, action)
    })
  }, [history])

  return <>{props.children}</>
}

const ReactRoot = () => {
  const appStore = useAppStore()

  // Load the data.
  useEffect(appStore.fetchData, [])

  let routes: [string, EMAppKind][] = [
    ['/about', 'about'],
    ['/settings', 'settings'],
    ['/list/:category/:subcategory/', 'table'],
    ['/list/:category/', 'category'],
    ['/list', 'category'],
  ]

  return (
    <EMSettingsProvider>
      <Router>
        <HistoryHook>
          <Switch>
            {routes.map(([slug, kind]) => (
              <Route key={slug} path={slug}>
                <EMApp appState={appStore.state.payload} kind={kind} />
              </Route>
            ))}
            <Route>
              <Redirect to={'/list'} />
            </Route>
          </Switch>
        </HistoryHook>
      </Router>
    </EMSettingsProvider>
  )
}

export default ReactRoot
