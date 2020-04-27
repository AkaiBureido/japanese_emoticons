import { useState, useReducer } from "react";
import { usePopper } from "react-popper";

export interface tooltipState {
    open: boolean,
    type?: string,
    content?: any,
}

export const useTooltip = (classBase: string) => {
    let [targetEl, setTargetEl] = useState(null);
    let [tooltipEl, setTooltipEl] = useState(null);
    let [tooltipTimeout, setTooltipTimeout] = useState(null);
    let [tooltipState, tooltipDispatch] = useReducer((state: tooltipState, action: {
        type: string;
        payload: any;
    }): tooltipState => {
        switch (action.type) {
            case "SET_OPEN": return { ...state, open: action.payload };
            case "SET_TYPE": return { ...state, type: action.payload };
            case "SET_CONTENT": return { ...state, content: action.payload };
        }
        return state;
    }, { open: false });
    let { type, open } = tooltipState;
    let popper = usePopper(targetEl, tooltipEl, {
        placement: "top",
        modifiers: [
            { name: "offset", options: { offset: [0, 8] } }
        ]
    });
    let classList = [classBase];
    if (type) {
        classList.push(`${classBase}-${type}`);
    }
    let attributes = {
        className: classList.join(" "),
        style: {
            ...popper.styles.popper,
            display: (open) ? "block" : "none",
        },
        ...popper.attributes
    };
    console.log("POP", tooltipState);
    return {
        attributes,
        setTooltipEl,
        showTooltip: (target: Node, timeout?: number, type?: string) => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            setTargetEl(target);
            let state = { ...tooltipState };
            tooltipDispatch({ type: "SET_OPEN", payload: true });
            if (type) {
                tooltipDispatch({ type: "SET_TYPE", payload: type });
            }
            else {
                tooltipDispatch({ type: "SET_TYPE", payload: null });
            }
            if (timeout) {
                setTooltipTimeout(setTimeout(() => {
                    tooltipDispatch({ type: "SET_OPEN", payload: false });
                }, timeout));
            }
        },
        hideTooltip: () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            tooltipDispatch({ type: "SET_OPEN", payload: false });
        }
    };
};
