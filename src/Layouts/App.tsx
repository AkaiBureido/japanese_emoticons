import * as React from "react"
import {
    useState, useEffect, useRef
} from "react"
import {
    MemoryRouter as Router,
    Switch, Route, Link,
    useParams as useRouterParams,
    useHistory as useBrowserHistory
} from "react-router-dom"
import {
    determineColspan, computeTableRowGroups, tableRowGroup
} from "self//Utils/TableLayout"
import {
    copyToClipboard
} from "self//Utils/Clipboard"
import {
    useLocalKaomojiStore, KaomojiStorePayload
} from "self//Reducers/KaomojiStore"
import {
    useTooltip
} from "self//Utils/Tooltip"

// Import Global CSS.
import "./App.less"

const ReactRoot = () => {
    const ks = useLocalKaomojiStore()

    // Load the data.
    useEffect(ks.fetchData, [])

    let routes = [
        "/:category/:subcategory/",
        "/:category/",
        "/"
    ]

    return <Router>
        <Switch>
            {routes.map((slug) =>
                <Route key={slug} path={slug}>
                    <EMApp kaomojiListing={ks.state.payload} />
                </Route>
            )}
        </Switch>
    </Router>
}

const EMApp = (props: { kaomojiListing: KaomojiStorePayload }) => {
    let browser = {
        route: useRouterParams() as any,
        history: useBrowserHistory(),
    }
    let req = browser.route

    if (!props.kaomojiListing) {
        return <EMPage title="Loading..." />
    }

    let backButton = <a className="button" href="#" onClick={browser.history.goBack}>Back</a>
    let pageCategories = (path: string[], page: string) => {
        return Object.keys(page).map(id => {
            let name = _categoryToDisplayName(id)
            return {
                id, name, path: [...path, id].join("/")
            }
        });
    }

    let path: string[] = [];
    let pageName = "Categories:"
    let pageContent : any = props.kaomojiListing
    let isCategoryListing = true

    if (req.category) {
        path.push(req.category);
        pageName = _categoryToDisplayName(req.category) + ":"
        pageContent = pageContent[req.category]
    }
    if (req.subcategory) {
        path.push(req.subcategory);
        pageName = _categoryToDisplayName(req.subcategory) + ":"
        pageContent = pageContent[req.subcategory].list
        isCategoryListing = false
    }

    let pageBody: React.ReactElement
    if (isCategoryListing) {
        pageBody = <EMViewCategoryList categories={pageCategories(path, pageContent)} />
    } else {
        let key = path.join("/")
        pageBody = <EMViewSmileTable pkey={key} list={pageContent}/>
    }

    return <EMPage title={pageName} widget={backButton}>
        {pageBody}
    </EMPage>
}

const EMPage = (
    props: {
        title: string,
        widget?: React.ReactElement,
        children?: React.ReactElement[] | React.ReactElement
    }
) => {
    return <>
        <nav className="page-nav">
            <h1 className="page-title">{props.title}</h1>
            <div className="page-widget">{props.widget}</div>
        </nav>
        <main className="page-view">
            {props.children}
        </main>
    </>
}

interface EMCategory {
    id?: string,
    name: string,
    path: string
}

const EMViewCategoryList = (props : { categories: EMCategory[] }) => {
    if (!props.categories) return;

    let items = [];
    for (const category in props.categories) {
        const { id, name, path } = props.categories[category];
        items.push(<li key={id}>
            <EMWidgetButton name={name} path={path} />
        </li>)
    }

    return <section className="view-category-list">
        <ul>
            {items}
        </ul>
    </section >
}

let smileMemo: { [key: string]: tableRowGroup[][] } = {};

const useSmileGroups = (hash: string, smileList: any[], calcEl: ()=>Node): tableRowGroup[][] => {
    let [groups, setGroups] = useState<tableRowGroup[][]>([]);

    useEffect(() => {
        if (hash && smileMemo[hash]) {
            setGroups(smileMemo[hash])
            return
        }

        if (!calcEl()) {
            return
        }

        let gs = determineColspan(calcEl(), smileList, 5)
        let out = computeTableRowGroups([...gs])
        smileMemo[hash] = out
        setGroups(out)
    }, [hash, smileList])

    return groups
}

const EMViewSmileTable = (props: { pkey: string, list: any[]}) => {
    let elCalcDiv = useRef(null)

    let groups = useSmileGroups(props.pkey, props.list, ()=>elCalcDiv.current)
    let tooltip = useTooltip("tooltip")

    let handleButtonClick = (e: React.MouseEvent<Node, MouseEvent>, key: string) => {
        if (copyToClipboard(e.currentTarget.textContent)) {
            tooltip.showTooltip(e.currentTarget, 500, "success")
        } else {
            tooltip.showTooltip(e.currentTarget, 500, "error")
        }
    }
    let handleButtonHover = (e: React.MouseEvent<Node, MouseEvent>, key: string) => {
        if (e.type == "mouseenter") {
            tooltip.showTooltip(e.currentTarget, 500)
        } else {
            tooltip.hideTooltip()
        }
    }

    let tablePartial = (
        <table>
            <tbody>
                {groups.map((row, i) =>
                    <tr key={i}>
                        {row.map((cell) => {
                            let key = cell.item.smiley
                            let style: React.CSSProperties = {
                                fontSize: `${cell.item.em_size ? cell.item.em_size : 1}em`
                            }
                            return (
                                <td
                                    key={key}
                                    colSpan={cell.colspan}
                                    style={style}
                                >
                                    <button
                                        className="smile-button"
                                        onClick={(e) => handleButtonClick(e, key)}
                                        onMouseEnter={(e) => handleButtonHover(e, key)}
                                        onMouseLeave={(e) => handleButtonHover(e, key)}
                                    >
                                        {cell.item.smiley}
                                    </button>
                                </td>
                            )
                        }
                        )}
                    </tr>
                )}
            </tbody>
        </table>
    )

    let body = [tablePartial];
    if (groups.length == 0) {
        body.push(<div key="calc" ref={elCalcDiv} />)
    }
    return <section className="view-smile-table">
        <div key="tooltip" ref={tooltip.setTooltipEl} {...tooltip.attributes}>
            Hello There
        </div>
        {body}
    </section>
}

const EMWidgetButton = (props: {name: string, path?: string}) => {
    const { name, path } = props;
    if (path) {
        return <Link to={path}>{name}</Link>
    } else {
        return <>{name}</>
    }
}

function _categoryToDisplayName(name: string) {
    if (!name) return
    return name.split("_")
        .map(wrd => wrd[0].toUpperCase() + wrd.substr(1))
        .join(" ");
}


export default ReactRoot;
