import {
  useEffect,
  createContext,
  useState,
  useContext,
  useMemo,
  createElement,
} from 'react'

export interface EMSettingsState {
  disableTooltipHints?: boolean
  oldStyle?: boolean
}

export type EMSettingsSetStateAction<S = EMSettingsState> = (prevState: S) => S
export type EMSettingsDispatch<S = EMSettingsSetStateAction> = (action: S) => void

export type EMSettingsContextValue = {
  settings: EMSettingsState
  setSettings: EMSettingsDispatch
}

const SettingsContext = createContext<EMSettingsContextValue>(null)

export function createSettingsProvider() {
  return (props: { children: any }) => {
    let [settings, setSettings] = useState<EMSettingsState>(initialSettingsState)

    // Persist settings on every change.
    useEffect(() => persistSettings(settings), [settings])

    // Set up context value.
    let contextValue = useMemo<EMSettingsContextValue>(
      () => ({
        settings: settings,
        setSettings: setSettings,
      }),
      [settings, setSettings],
    )

    return createElement(
      SettingsContext.Provider,
      { value: contextValue },
      props.children,
    )
  }
}

export function useSettingsContext(): EMSettingsContextValue {
  return useContext(SettingsContext)
}

// ----------------------------------------------------------------------

const defaultSettings = (): EMSettingsState => ({
  disableTooltipHints: true,
})

function initialSettingsState() {
  let initialValue: EMSettingsState = loadSettings()
  return initialValue ? initialValue : defaultSettings()
}

function loadSettings(): EMSettingsState {
  try {
    return JSON.parse(window.localStorage.getItem('settings'))
  } catch {}
  return null
}

function persistSettings(settings: EMSettingsState) {
  return window.localStorage.setItem('settings', JSON.stringify(settings))
}
