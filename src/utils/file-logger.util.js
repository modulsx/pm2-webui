const config = require('../config')
const fs = require('fs')
const { join } = require('path');
const { cyan, green, red, yellow } = require('ansicolor');

class FileLogger {
    #writeStream;

    constructor({appName, timestamp }){
        this.appName = appName
        this.timestamp = timestamp === true ? true: false
        this.#writeStream = fs.createWriteStream(
            join(config.DEPLOYMENTS_LOGS_DIR, `${appName}.log`), { flags: 'a' });
    }

    #getTimestamp() {
        return new Date().toLocaleString([], { hour12: true}).toUpperCase()
    }

    #writeLog(...vals){
        const log = `${this.timestamp? this.#getTimestamp()+ ' ': ''}${green(this.appName)} ${vals.join(' ')}\n`
        this.#writeStream.write(log)
    }

    log(data){
        this.#writeLog(data)
    }

    command(data){
        this.#writeLog(yellow('[Running]'), cyan(data))
    }

    success(data){
        this.#writeLog(green(data))
    }

    error(data){
        this.#writeLog(red(data))
    }

    close(){
        this.#writeStream.end()
    }
}

module.exports = FileLogger
