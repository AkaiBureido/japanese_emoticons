import * as React from 'react'
import {Fragment, ReactElement} from "react";

export type WidgetSpec = {
  action: Function
  hint: string
  content: any
}

export const EMViewPage = (props: {
  title: string
  widgets?: WidgetSpec[]
  children?: React.ReactElement[] | React.ReactElement
}) => {
  return <Fragment>
    <nav className='page-nav'>
      <h1 className='page-nav-title'>{props.title}</h1>
      <div className='page-nav-widget'>{renderWidgetSpecs(props.widgets)}</div>
    </nav>
    <main className='page-view'>{props.children}</main>
  </Fragment>
}

function renderWidgetSpecs(widgets?: WidgetSpec[]): ReactElement {
  if (!widgets) return null
  return <Fragment>
    {widgets.map((w, idx) => (
      <Fragment key={w.hint}>
        {idx > 0 ? ' ' : null}
        <a title={w.hint} className='button' href='#' onClick={() => w.action()}>
          {w.content}
        </a>
      </Fragment>
    ))}
  </Fragment>
}

export default EMViewPage
