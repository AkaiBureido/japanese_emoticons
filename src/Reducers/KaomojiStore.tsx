import * as React from "react";
import {useReducer} from "react";

export interface KaomojiStorePayload {
    [category: string]: {
        [subCategory: string]: {
            url:  string,
            list: string[],
        }[],
    },
}
export interface KaomojiStoreState {
    loading: boolean;
    initialized: boolean;
    payload?: KaomojiStorePayload;
    error?: any;
}

export interface KaomokiStoreAction {
    type: "init" | "load-pending" | "load-done" | "load-error";
    payload?: any;
}

const init = (): KaomojiStoreState => {
    return {
        loading: false,
        initialized: false,
        payload: null,
        error: null,
    }
}

const reducer = (state: KaomojiStoreState, action: KaomokiStoreAction): KaomojiStoreState => {
    switch (action.type) {
        case 'init':
            return this.init();
        case 'load-pending':
            return {
                ...state,
                loading: true,
                initialized: false,
            };
        case 'load-done':
            return {
                ...state,
                loading: false,
                initialized: true,
                payload: action.payload.data,
                error: null
            };
        case 'load-error':
            return {
                ...state,
                loading: false,
                initialized: false,
                payload: null,
                error: action.payload.error
            };
        default:
            throw new Error();
    }
}

export const useLocalKaomojiStore = () => {
    const [state, dispatch] = useReducer(reducer, null, init);

    let fetchData = () => {
        dispatch({
            type: "load-pending",
        });
        fetch("/data/emoticons.json").then(
            (rs) => rs.json()
        ).then((data) => {
            dispatch({
                type: "load-done",
                payload: {
                    data: data,
                }
            });
        }).catch((error) => {
            dispatch({
                type: "load-error",
                payload: {
                    error: error,
                }
            });
        });
    };

    return {
        state,
        fetchData,
    };
};

export const getKaomojiListing = (listing: any, path: {category?: string, subcategory?: string}) => {
    let id: string = null;
    let name: string = null;
    let opath = ["list"];

    let data = listing;

    if (path.category) {
        id = path.category
        opath = [...opath, path.category]
        name = categoryToDisplayName(path.category)
        data = data[path.category]
    }

    if (path.subcategory) {
        id = path.subcategory
        opath = [...opath, path.subcategory]
        name = categoryToDisplayName(path.subcategory)
        data = data[path.subcategory]
    }

    return {
        id,
        name,
        path: "/" + [...opath].join("/"),
        data: data,
        content: () => Object.keys(data).map(id => ({
            id,
            name: categoryToDisplayName(id),
            path: "/" + [...opath, id].join("/")
        }))
    }
}

const categoryToDisplayName = (name: string) => {
    if (!name) return
    return name.split("_")
        .map(wrd => wrd[0].toUpperCase() + wrd.substr(1))
        .join(" ");
}
