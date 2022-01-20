const config = require('../../config')
const { getValidatedDeploymentsConfig } = require('./validations')

const findAllDeploymentApps = async () => {
    const deployments = await getValidatedDeploymentsConfig(config.DEPLOYMENTS_CONFIG_PATH)
    return deployments.apps
}

const findOneDeploymentApp = async (appName) => {
    const deployments = await getValidatedDeploymentsConfig(config.DEPLOYMENTS_CONFIG_PATH)
    return deployments.apps.find(app => app.name === appName)
}

module.exports = {
    findAllDeploymentApps,
    findOneDeploymentApp
}