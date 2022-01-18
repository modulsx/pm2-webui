const { cyan, green, red, yellow } = require('ansicolor');

// kleur.enabled = (process.env.NODE_DISABLE_COLORS === true || process.env.NO_COLOR === true) ? false: true

const timestamp = () => {
    return new Date().toLocaleString([], { hour12: true}).toUpperCase()
}

const logCommand = (command, options = {}) => {
    const output = [];
    if(options.prefix){
        output.push(green(`[${options.prefix}]`))
    }
    if(options.timestamp){
        output.push(timestamp())
    }
    output.push(yellow('[Running]'))
    output.push(cyan(command))
    console.log(output.join(' '))
}

const logSuccess = (statement, options = {}) => {
    const output = [];
    if(options.prefix){
        output.push(green(`[${options.prefix}]`))
    }
    if(options.timestamp){
        output.push(timestamp())
    }
    output.push(green(statement))
    console.log(output.join(' '))
}

const logError = (statement, options = {}) => {
    const output = [];
    if(options.prefix){
        output.push(green(`[${options.prefix}]`))
    }
    if(options.timestamp){
        output.push(timestamp())
    }
    output.push(red(statement))
    console.error(output.join(' '))
}

const logInfo = (statement, options = {}) => {
    const output = [];
    if(options.prefix){
        output.push(green(`[${options.prefix}]`))
    }
    if(options.timestamp){
        output.push(timestamp())
    }
    output.push(statement)
    console.log(output.join(' '))
}

module.exports = {
    logCommand,
    logSuccess,
    logError,
    logInfo
}