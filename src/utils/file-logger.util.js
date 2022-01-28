const config = require('../config')
const fs = require('fs')
const { join } = require('path');
const { cyan, green, red, yellow } = require('ansicolor');

class FileLogger {
    #writeStream;   
    #stdio;

    constructor({appName, timestamp, stdio }){
        this.appName = appName
        this.timestamp = timestamp === true ? true: false
        this.#stdio = stdio === true? true: false
        this.#writeStream = fs.createWriteStream(
            join(config.DEPLOYMENTS_LOGS_DIR, `${appName}.log`), { flags: 'a' });
        this.#logExtraLine()
    }

    #logExtraLine(){
        this.#writeStream.write('\n')
    }

    #getTimestamp() {
        return new Date().toLocaleString([], { hour12: true}).toUpperCase()
    }

    #writeLog(...vals){
        const log = `${this.timestamp? this.#getTimestamp()+ ' ': ''}[${green(this.appName)}] ${vals.join(' ')}\n`
        this.#writeStream.write(log)
        if(this.#stdio){
            console.log(log)
        }
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
        this.#logExtraLine()
        this.#writeStream.end()
    }
}

module.exports = FileLogger
