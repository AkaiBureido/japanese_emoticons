import * as React from "react";

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
    const [state, dispatch] = React.useReducer(reducer, null, init);

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
        fetchData
    };
};

export default useLocalKaomojiStore