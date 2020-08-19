import { useState, useEffect, useCallback } from 'react'
import { usePopper } from 'react-popper'

export interface tooltipState {
  open: boolean
  type?: string
  content?: any

  targetEl?: any
  tooltipEl?: any
}

function usePopperAttributes<T>(o: {
  classBase: string
  type: string
  open: boolean
  initialized: boolean
  popper: ReturnType<typeof usePopper>
}) {
  let [attributes, setAttributes] = useState(null)
  let classList = [o.classBase]
  if (o.type) {
    classList.push(`${o.classBase}-${o.type}`)
  }
  if (o.open && o.initialized && o.popper.state) {
    classList.push(`${o.classBase}-open`)
  } else {
    classList.push(`${o.classBase}-closed`)
  }
  let newAttributes = {
    className: classList.join(' '),
    style: { ...o.popper.styles.popper },
    ...o.popper.attributes,
  }
  if (JSON.stringify(newAttributes) !== JSON.stringify(attributes)) {
    setAttributes(newAttributes)
  }
  return attributes
}

export const useTooltip = (classBase: string) => {
  let [tooltipTimeout, setTooltipTimeout] = useState(null)
  let [tooltipState, setTooltipState] = useState<tooltipState>({ open: false })

  let { type, open, targetEl, tooltipEl } = tooltipState

  let popper = usePopper(targetEl, tooltipEl, {
    placement: 'top',
    modifiers: [
      { name: 'hide', options: {} },
      { name: 'offset', options: { offset: [0, 5] } },
    ],
  })

  let attributes = usePopperAttributes({
    classBase,
    type,
    open,
    initialized: targetEl && tooltipEl,
    popper,
  })

  let update = useCallback(() => {
    if (popper.forceUpdate !== null) {
      popper.forceUpdate()
    }
  }, [popper])

  let setTooltip = useCallback(
    (el) => {
      if (el) {
        setTooltipState((s) => ({ ...s, tooltipEl: el }))
      }
    },
    [setTooltipState],
  )

  let showTooltip = useCallback(
    (target: Node, timeout?: number, type?: string, cb?: () => any) => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
      setTooltipState((s) => ({
        ...s,
        open: true,
        type: type ? type : null,
        targetEl: target,
      }))
      cb()
      if (timeout) {
        setTooltipTimeout(
          setTimeout(() => {
            setTooltipState((s) => ({
              ...s,
              open: false,
            }))
          }, timeout),
        )
      }
    },
    [setTooltipState, setTooltipTimeout],
  )

  let hideTooltip = useCallback(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
    setTooltipState((s) => ({
      ...s,
      open: false,
    }))
  }, [setTooltipState, setTooltipTimeout])

  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
    }
  }, [tooltipTimeout])

  return {
    attributes,
    update,
    setTooltip,
    showTooltip,
    hideTooltip,
  }
}
