import * as Server from '../index.js'

export const getRunningExpressApp = function () {
    const runningExpressInstance = Server.getInstance()
    if (typeof runningExpressInstance === 'undefined') {
        throw new Error(`Error: getRunningExpressApp failed!`)
    }
    return runningExpressInstance
}