import * as React from 'react';

import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { Metrics } from 'self://Utils/Metrics';

export interface EMSettings {
  disableTooltipHints?: boolean
  oldStyle?: boolean
}

export type EMSettingsDispatch = (cb: (EMSettings) => EMSettings) => void
export type EMSettingsContextType = { settings: EMSettings; setSettings: EMSettingsDispatch }

export const EMSettingsContext = React.createContext<EMSettingsContextType>(null)

const defaultSettings = (): EMSettings => ({
  disableTooltipHints: true,
})

export const useSettings = (): EMSettings => {
  let settings = useContext(EMSettingsContext).settings
  return settings ? settings : defaultSettings()
}

export const EMSettingsProvider = (props: { children: any }) => {
  let [settings, setSettings] = useState<EMSettings>(() => {
    let initialValue: EMSettings = null
    try {
      initialValue = JSON.parse(window.localStorage.getItem('settings'))
      if (!initialValue) {
        Metrics.event({category: "user", action: "first-time"})
      }
    } catch {}
    return initialValue ? initialValue : defaultSettings()
  })

  useEffect(() => {
    window.localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  let set = useCallback(
    (cb: (EMSettings) => EMSettings) => {
      setSettings((s) => {
        return cb(s)
      })
    },
    [setSettings],
  )

  let value = useMemo<EMSettingsContextType>(() => {
    return {
      settings: settings,
      setSettings: set,
    }
  }, [settings, set])

  return (
    <EMSettingsContext.Provider value={value}>
      {props.children}
    </EMSettingsContext.Provider>
  )
}
