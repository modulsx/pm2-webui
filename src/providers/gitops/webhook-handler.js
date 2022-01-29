const { getSHA1 } = require('../../utils/hash.util')

const validateWebhook = (app, headers, data) => {
    if(!app || app.autodeploy !== true ){
        return false
    }
    if(data.ref.split('/')[2] !== app.git_branch){
        return false
    }
    const sha1 = getSHA1(data, app.webhook_secret)
    const signature = 'sha1='+sha1
    if(headers['x-hub-signature'] !== signature){
        return false
    }
    return true
}

module.exports = {
    validateWebhook
}