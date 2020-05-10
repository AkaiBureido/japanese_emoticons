import * as ReactGA from "react-ga";

let initated = false

const init = () => {
  if (process.env.GA) {
    // initated = true
    // ReactGA.initialize(process.env.GA, {
    //     debug: process.env.DEBUG,
    //     titleCase: false
    // })
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
  console.log("pageview", args)
}

const event: typeof ReactGA.event = (...args) => {
  if (initated) {
    ReactGA.event(...args)
  }
  console.log("event", args[0])
}

const timing: typeof ReactGA.timing = (...args) => {
  if (initated) {
    ReactGA.timing(...args)
  }
  console.log("timing", args[0])
}

export const Metrics = {
  init,
  pageview,
  event,
  timing
}