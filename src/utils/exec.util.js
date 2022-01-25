const util = require('util');
const exec = util.promisify(require('child_process').exec);

const execCommand = async (command, options = {}) => {
    const { logger, verbose, ...rest } = options
    logger.command(command)
    const { stdout, stderr } = await exec(command, { maxBuffer: 1024 * 1024, ...rest})
    if(verbose === true){
        logger.log(stdout)
    }
    return { stdout, stderr }
}

module.exports = {
    execCommand
}