import * as React from 'react'

import {
  EventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface EMSettings {
  disableTooltipHints?: boolean
}

type EMSettingsDispatch = (cb: (EMSettings) => EMSettings) => void
type EMSettingsContextType = { settings: EMSettings; setSettings: EMSettingsDispatch }

const EMSettingsContext = React.createContext<EMSettingsContextType>(null)

export const useSettings = (): EMSettings => {
  let settings = useContext(EMSettingsContext).settings
  return settings ? settings : defaultSettings()
}

export const EMSettingsProvider = (props: { children: any }) => {
  let [settings, setSettings] = useState<EMSettings>(() => {
    let initialValue: EMSettings = null
    try {
      initialValue = JSON.parse(window.localStorage.getItem('settings'))
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

export const EMSettingsView = () => {
  let { settings, setSettings } = useContext(EMSettingsContext)

  let changeCB = useCallback<EventHandler<any>>(
    (e) => {
      let target = e.target as any

      if (target.name === 'disableTooltipHints') {
        setSettings((settings) => {
          return { ...settings, disableTooltipHints: target.checked }
        })
      }
    },
    [setSettings],
  )

  return (
    <section className={'view-settings-page'}>
      <hr/>
      <label>
        <input
          type='checkbox'
          name='disableTooltipHints'
          checked={settings.disableTooltipHints}
          onChange={changeCB}
        />
        Disable Hover Tooltips
      </label>
      <hr/>
    </section>
  )
}

const defaultSettings = (): EMSettings => ({
  disableTooltipHints: true,
})
