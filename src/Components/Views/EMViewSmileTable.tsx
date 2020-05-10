import * as React from 'react'
import * as ReactGA from 'react-ga'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
  MouseEventHandler,
  useMemo,
} from 'react'
import {
  constructTableGroups,
  tableGroupsToTableRows,
  TableRowGroup,
} from 'self://Utils/TableLayout'
import { copyToClipboard } from 'self://Utils/Clipboard'
import { useTooltip } from 'self://Utils/Tooltip'
import { useSettings } from 'self://Components/Views/EMViewSettings'
import { Metrics } from 'self://Utils/Metrics'

const useSmileGroups = (
  hash: string,
  smileList: any[],
  calcEl: () => Node,
): TableRowGroup[][] => {
  let [groups, setGroups] = useState<TableRowGroup[][]>([])

  useLayoutEffect(() => {
    if (groups.length > 0) {
      return
    }

    let time0 = performance.now()
    let gs = constructTableGroups(calcEl(), smileList, 5)
    let time1 = performance.now()
    let tg = tableGroupsToTableRows([...gs])
    let time2 = performance.now()

    Metrics.timing({
      category: "table-group", variable: "constructTableGroups", value: time1-time0,
    })
    Metrics.timing({
      category: "table-group", variable: "tableGroupsToTableRows", value: time2-time1,
    })

    setGroups(tg)
    let t0 = performance.now()
  }, [smileList, hash])

  return groups
}

export const EMViewSmileTable = (props: { hash: string; content: { list: any[] } }) => {
  let elCalcDiv = useRef(null)
  let groups = useSmileGroups(props.hash, props.content.list, () => elCalcDiv.current)

  let tooltip = useTooltip('tooltip')
  let [tooltipContent, setTooltipContent] = useState(null)
  let [tooltipTimeout, setTooltipTimeout] = useState(null)
  let settings = useSettings()

  let handleButtonClick = useCallback(
    (e: React.MouseEvent<any>) => {
      let target = e.currentTarget as any
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }

      if (copyToClipboard(target.textContent)) {
        Metrics.event({
          category: [props.hash, target.textContent].join(' :: '),
          action: 'copy',
        })
        tooltip.showTooltip(target, 500, 'success', () => {
          setTooltipContent('Copied')
        })
      } else {
        tooltip.showTooltip(target, 500, 'error')
      }
    },
    [tooltip, tooltipTimeout],
  )

  let handleButtonHover = useCallback(
    (e: React.MouseEvent<any>) => {
      let target = e.currentTarget as any
      let eventType = e.type

      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }

      if (!settings.disableTooltipHints) {
        if (eventType == 'mouseenter') {
          setTooltipTimeout(
            setTimeout(() => {
              tooltip.showTooltip(target, 4000, null, () => {
                setTooltipContent('Click to copy')
              })
            }, 1000),
          )
        } else {
          tooltip.hideTooltip()
        }
      }
    },
    [tooltip, tooltipTimeout],
  )

  useLayoutEffect(() => {
    tooltip.update()
  }, [tooltipContent])

  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
    }
  }, [tooltipTimeout])

  return (
    <section className='view-smile-table'>
      <div key='tooltip' ref={tooltip.setTooltip} {...tooltip.attributes}>
        {tooltipContent}
      </div>
      <EMWidgetKaomojiTable
        groups={groups}
        onClick={handleButtonClick}
        onHover={handleButtonHover}
      />
      <div key='calc' ref={elCalcDiv} />
    </section>
  )
}

const EMWidgetKaomojiTable = (props: {
  groups: TableRowGroup[][]
  onClick: MouseEventHandler
  onHover: MouseEventHandler
}) => {
  return (
    <table>
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
                  className='smile-button'
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
