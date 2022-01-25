const fs = require('fs')
const path = require('path')
const config = require('../../config')
const { getValidatedDeploymentsConfigSync } = require('./validations')

const runDeploymentsSetup = () => {
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
    getValidatedDeploymentsConfigSync(config.DEPLOYMENTS_CONFIG_PATH)
}

module.exports = {
    runDeploymentsSetup
}