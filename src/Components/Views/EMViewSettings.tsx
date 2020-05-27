import * as React from 'react'

import { EventHandler, useCallback, useContext, } from 'react'

import { EMSettingsContext } from 'self://Components/EMSettings';


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

      if (target.name === 'enableOldStyle') {
        setSettings((settings) => {
          return { ...settings, oldStyle: target.checked }
        })
      }
    },
    [setSettings],
  )

  return (
    <section className={'view-settings-page'}>
      <label title={"This disables the tooltip hints appearing on mouse hover in the Kaomoji table"}>
        <input
          type='checkbox'
          name='disableTooltipHints'
          checked={settings.disableTooltipHints}
          onChange={changeCB}
        />
        Disable Hover Tooltips
      </label>
      <label title={"This enables old CSS Styles"}>
        <input
          type='checkbox'
          name='enableOldStyle'
          checked={settings.oldStyle}
          onChange={changeCB}
        />
        Enable Old Style
      </label>
    </section>
  )
}