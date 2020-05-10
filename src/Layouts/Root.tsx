import * as React from 'react'
import * as ReactGA from 'react-ga'

import { ReactElement, useCallback, useEffect } from 'react'
import { MemoryRouter as Router, useHistory } from 'react-router-dom'
import { Switch, Route, Redirect } from 'react-router'

import { EMApp, EMAppKind } from 'self://Layouts/EMApp'
import { useLocalKaomojiStore } from 'self://Reducers/KaomojiStore'
import { EMSettingsProvider } from "self://Components/Views/EMViewSettings";
import {Metrics} from "self://Utils/Metrics";

type HLocation = Parameters<Parameters<ReturnType<typeof useHistory>['listen']>[0]>[0]

const HistoryCB = (props: { children: ReactElement }) => {
  let history = useHistory()

  let trackPage = useCallback((location: HLocation, action: string) => {
    if (action === "PUSH" || action === "LOAD") {
      Metrics.pageview(location.pathname)
    }
  }, [])

  useEffect(() => {
    trackPage(history.location, "LOAD")
    return history.listen((location, action) => {
      trackPage(location, action)
    });
  }, [history])

  return <>{props.children}</>
}

const ReactRoot = () => {
  const kaomojiStore = useLocalKaomojiStore()

  // Load the data.
  useEffect(kaomojiStore.fetchData, [])

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
          <HistoryCB>
            <Switch>
              {routes.map(([slug, kind]) => (
                <Route key={slug} path={slug}>
                  <EMApp kaomojiListing={kaomojiStore.state.payload} kind={kind} />
                </Route>
              ))}
              <Route>
                <Redirect to={'/list'} />
              </Route>
            </Switch>
          </HistoryCB>
      </Router>
    </EMSettingsProvider>
  )
}

export default ReactRoot
