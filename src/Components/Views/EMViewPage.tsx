import * as React from "react"

export const EMViewPage = (props: {
    title: string;
    widget?: React.ReactElement;
    children?: React.ReactElement[] | React.ReactElement;
}) => {
    return <>
        <nav className="page-nav">
            <h1 className="page-title">{props.title}</h1>
            <div className="page-widget">{props.widget}</div>
        </nav>
        <main className="page-view">
            {props.children}
        </main>
    </>;
};
