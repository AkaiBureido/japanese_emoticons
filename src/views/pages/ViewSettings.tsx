import * as React from 'react'

import { useCallback, useContext } from 'react'
import type {EventHandler} from 'react'

import { useSettingsContext } from 'JEM/store/settings'

export const EMSettingsPage = () => {
  let { settings, setSettings } = useSettingsContext()

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
      <label title='This disables the tooltip hints appearing on mouse hover in the Kaomoji table'>
        <input
          type='checkbox'
          name='disableTooltipHints'
          checked={settings.disableTooltipHints}
          onChange={changeCB}
        />
        Disable Hover Tooltips
      </label>
      <label title={'This enables old CSS Styles'}>
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
