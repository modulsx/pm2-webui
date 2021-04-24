const fs = require('fs');

const getEnvFileContent = async (cwd)=>{
    return new Promise((resolve, reject) => {
        fs.readFile(`${cwd}/.env` , 'utf-8', function(err, data){
            if(!err){
                resolve(data)
            }
            resolve(null)
        })
    })
}

module.exports = {
    getEnvFileContent
}