import * as React from "react";
import {Link} from "react-router-dom";

export const EMWidgetButton = (props: { name: string, path?: string }) => {
    const {name, path} = props;
    if (path) {
        return <Link to={path}>{name}</Link>
    } else {
        return <>{name}</>
    }
}