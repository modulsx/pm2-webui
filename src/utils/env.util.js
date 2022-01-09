const fs = require('fs');
const envfile = require('envfile')
const path = require('path')

const getEnvFileContent = async (wd)=>{
    const envPath = path.join(wd, '.env')
    return new Promise((resolve, reject) => {
        fs.readFile(envPath , 'utf-8', function(err, data){
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
    return envfile.parse(fs.readFileSync(envPath , 'utf-8'))
}

const setEnvDataSync = (wd, envData) => {
    const envPath = path.join(wd, '.env')
    let parseEnvData = getEnvDataSync(envPath)
    const finalData = {
        ...parseEnvData,
        ...envData
    }
    fs.writeFileSync(envPath, envfile.stringify(finalData))
    return true
}

module.exports = {
    getEnvFileContent,
    getEnvDataSync,
    setEnvDataSync
}