import * as React from "react";
import { Link, useHistory } from 'react-router-dom';

export const EMWidgetButton = (props: { name: any, path?: string }) => {
    let history = useHistory();

    const {name, path} = props;
    if (path) {
        return <a href="#" onClick={()=>history.push(path)}>{name}</a>
    } else {
        return <>{name}</>
    }
}