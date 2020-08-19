import * as React from 'react'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  MouseEventHandler,
} from 'react'

import {
  constructTableGroups,
  tableGroupsToTableRows,
  TableRowGroup,
} from 'JEM/utils/table-layout'

import { useSettingsContext } from 'JEM/store/settings'

import { copyToClipboard } from 'JEM/utils/clipboard'
import { useTooltip } from 'JEM/utils/tooltip'

import { Metrics } from 'JEM/utils/metrics'

function useSmileGroups(
  key: string,
  emojiList: any[],
  calcEl: () => Node,
): TableRowGroup[][] {
  let [groups, setGroups] = useState<TableRowGroup[][]>([])

  useEffect(() => {
    if (groups.length > 0) {
      return
    }

    let t0 = performance.now()
    let tableGroups = constructTableGroups(calcEl(), emojiList, 4, 4)
    let t1 = performance.now()
    let groupRows = tableGroupsToTableRows([...tableGroups])
    let t2 = performance.now()

    Metrics.timing({
      category: 'table-group',
      variable: 'constructTableGroups',
      label: key,
      value: t1 - t0,
    })
    Metrics.timing({
      category: 'table-group',
      variable: 'tableGroupsToTableRows',
      label: key,
      value: t2 - t1,
    })

    setGroups(groupRows)
  }, [emojiList, key])

  return groups
}

function useTooltipWidget(classBase: string) {
  let tooltip = useTooltip(classBase)

  let [content, setContent] = useState(null)
  let [timeout, setTimeout] = useState<number>(null)

  // Ensure timeout is cancelled after component is unmounted.
  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [timeout])

  useLayoutEffect(() => {
    tooltip.update()
  }, [content])

  return {
    content,
    setContent,

    timeout,
    setTimeout,
    clearTimeout: () => clearTimeout(timeout),

    attributes: tooltip.attributes,

    setRef: tooltip.setTooltip,
    show: tooltip.showTooltip,
    hide: tooltip.hideTooltip,
    update: tooltip.update,
  }
}

export function EMViewSmileTable(props: { hash: string; content: { list: any[] } }) {
  let { settings } = useSettingsContext()
  let tooltip = useTooltipWidget('widget-tooltip')

  let elCalcDiv = useRef(null)
  let groups = useSmileGroups(props.hash, props.content.list, () => elCalcDiv.current)

  let handleEmojiClick = useCallback(
    (e: React.MouseEvent<any>) => {
      let target = e.currentTarget as any
      if (tooltip.timeout) {
        tooltip.clearTimeout()
      }

      if (copyToClipboard(target.textContent)) {
        Metrics.event({
          category: [props.hash, target.textContent].join(' :: '),
          action: 'copy',
        })
        tooltip.show(target, 500, 'success', () => {
          tooltip.setContent(<>Copied</>)
        })
      } else {
        tooltip.show(target, 3000, 'error', () => {
          tooltip.setContent(<>Error Copying to Clipboard</>)
        })
      }
    },
    [tooltip],
  )

  let handleEmojiHover = useCallback(
    (e: React.MouseEvent<any>) => {
      let target = e.currentTarget as any
      let eventType = e.type

      if (tooltip.timeout) {
        tooltip.clearTimeout()
      }

      if (!settings.disableTooltipHints) {
        if (eventType == 'mouseenter') {
          let timeout = window.setTimeout(() => {
            tooltip.show(target, 3000, null, () => {
              tooltip.setContent(<>Click to copy</>)
            })
          }, 1000)

          tooltip.setTimeout(timeout)
        } else {
          tooltip.hide()
        }
      }
    },
    [tooltip],
  )

  return (
    <section className='view-smile-table'>
      <div ref={tooltip.setRef} {...tooltip.attributes}>
        {tooltip.content}
      </div>
      <EmojiTable groups={groups} onClick={handleEmojiClick} onHover={handleEmojiHover} />
      <div className='view-smile-table-calc' ref={elCalcDiv} />
    </section>
  )
}

const EmojiTable = (props: {
  groups: TableRowGroup[][]
  onClick: MouseEventHandler
  onHover: MouseEventHandler
}) => {
  return (
    <table className='widget-smile-table'>
      <tbody>
        {props.groups.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map(({ item, colspan }) => (
              <td
                key={item.smiley}
                colSpan={colspan}
                style={{
                  fontSize: `${item.em_size ? item.em_size : 1}em`,
                }}
              >
                <button
                  className='widget-expanded-button'
                  onClick={props.onClick}
                  onMouseEnter={props.onHover}
                  onMouseLeave={props.onHover}
                >
                  {item.smiley}
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
