import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactGA from "react-ga";
import Root from "self://Layouts/Root";

import "./index.less"

ReactDOM.render(
    React.createElement(Root, null, null),
    document.getElementById("app")
)
