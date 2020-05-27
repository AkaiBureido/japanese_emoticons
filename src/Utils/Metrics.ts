import * as ReactGA from "react-ga";

let initated = false

const init = () => {
  console.log(process.env.GA)
  if (typeof process.env.GA !== "undefined") {
    initated = true
    ReactGA.initialize(process.env.GA, {
      debug: process.env.DEBUG,
      titleCase: false,
    })
    window.ga_debug = { trace: true }
  }
}

const pageview: typeof ReactGA.pageview = (...args) => {
  if (initated) {
    ReactGA.pageview(...args)
  }
  event({
    category: args[0],
    action: "pageview"
  })
  if (process.env.DEBUG) {
    console.log("pageview", args)
  }
}

const event: typeof ReactGA.event = (...args) => {
  if (initated) {
    ReactGA.event(...args)
  }
  if (process.env.DEBUG) {
    console.log("event", args[0])
  }
}

const timing: typeof ReactGA.timing = (...args) => {
  if (initated) {
    ReactGA.timing(...args)
  }
  if (process.env.DEBUG) {
    console.log("timing", args[0])
  }
}

export const Metrics = {
  init,
  pageview,
  event,
  timing
}