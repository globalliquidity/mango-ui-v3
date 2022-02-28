const moment = require('moment')

const log = (content: any, value?: any) => {
  const isEnabled = true

  if (isEnabled) {
    console.log(moment().format())
    console.log(content || '', value || '')
  }
}

const timestamp = () => {
  return window.performance && window.performance.now
    ? window.performance.now()
    : new Date().getTime()
}

const Logger = {
  log,
  timestamp,
}

export default Logger
