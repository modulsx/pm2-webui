const fs = require('fs');
const { parse, stringify } = require('./envfile.util')
const path = require('path')

const getEnvFileContent = async (wd)=>{
    const envPath = path.join(wd, '.env')
    return new Promise((resolve, reject) => {
        fs.readFile(envPath , 'utf-8', function(err, data){
            if(!err){
                resolve(data)
            }
            resolve('')
        })
    })
}


const setEnvFileContent = async (wd, envData)=>{
    return new Promise((resolve, reject) => {
        const envPath = path.join(wd, '.env')
        fs.writeFile(envPath , envData, function(err, data){
            if(!err){
                resolve(data)
            }
            resolve(null)
        })
    })
}

const getEnvDataSync = (envPath) => {
    if (!fs.existsSync(envPath)) { 
        fs.closeSync(fs.openSync(envPath, 'w'))
    } 
    return parse(fs.readFileSync(envPath , 'utf-8'))
}

const setEnvDataSync = (wd, envData) => {
    const envPath = path.join(wd, '.env')
    let parseEnvData = getEnvDataSync(envPath)
    const finalData = {
        ...parseEnvData,
        ...envData
    }
    fs.writeFileSync(envPath, stringify(finalData))
    return true
}

module.exports = {
    getEnvFileContent,
    getEnvDataSync,
    setEnvDataSync,
    setEnvFileContent
}