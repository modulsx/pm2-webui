const fs = require('fs')
const config = require('../../config')
const { deployHooksSchema } = require('../../validations/deploy-hooks.validation')

const _getValidatedDeploymentsConfig =  async () => {
    const deploymentsConfigFile = await fs.promises.readFile(config.DEPLOYMENTS_CONFIG_PATH, 'utf8');
    const deploymentsConfigJson = JSON.parse(deploymentsConfigFile)
    return deployHooksSchema.validateAsync(deploymentsConfigJson)
}

const findAllDeploymentApps = async () => {
    const deployments = await _getValidatedDeploymentsConfig()
    return deployments.apps
}

const findOneDeploymentApp = async (appName) => {
    const deployments = await _getValidatedDeploymentsConfig()
    return deployments.apps.find(app => app.name === appName)
}

module.exports = {
    findAllDeploymentApps,
    findOneDeploymentApp
}