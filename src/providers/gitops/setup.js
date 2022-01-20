const fs = require('fs')
const path = require('path')
const config = require('../../config')
const { deployHooksSchema } = require('../../validations/deploy-hooks.validation')


const _validateDeploymentsConfigSync = () => {
    const deploymentsConfigFile = fs.readFileSync(config.DEPLOYMENTS_CONFIG_PATH, 'utf8')
    const deploymentsConfigJson = JSON.parse(deploymentsConfigFile)
    return deployHooksSchema.validate(deploymentsConfigJson)
}

const runDeploymentsSetup = () => {
    if (!fs.existsSync(config.DEPLOYMENTS_BUILDS_DIR)){
        fs.mkdirSync(config.DEPLOYMENTS_BUILDS_DIR, { recursive: true });
    }
    if (!fs.existsSync(config.DEPLOYMENTS_LOGS_DIR)){
        fs.mkdirSync(config.DEPLOYMENTS_LOGS_DIR, { recursive: true });
    }
    if(path.extname(config.DEPLOYMENTS_CONFIG_PATH) !== '.json'){
        throw new Error('Deployments config must be a json file')
    }
    if (!fs.existsSync(config.DEPLOYMENTS_CONFIG_PATH)){
        fs.mkdirSync(path.dirname(config.DEPLOYMENTS_CONFIG_PATH), { recursive: true })
        fs.writeFileSync(config.DEPLOYMENTS_CONFIG_PATH, JSON.stringify({apps: []}, null, 4))
    }
    const { error } = _validateDeploymentsConfigSync()
    if(error){
        throw new Error(`Deployments Config Validation Error: ${error.message}`)
    }
}

module.exports = {
    runDeploymentsSetup
}