const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { logCommand } = require('./logger.util')

const execCommand = async (command, options = {}) => {
    const { prefix, ...rest } = options
    logCommand(command, { prefix, timestamp: true })
    return exec(command, { ...rest })
}

module.exports = {
    execCommand
}