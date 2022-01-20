const config = require('../config')
const { logError } = require('../utils/logger.util')
const { runDeployment } = require('../providers/gitops/runner')
const { findAllDeploymentApps, findOneDeploymentApp } = require('../providers/gitops/api')

const deployNow = async (appName) => {
    try {
        if(!config.DEPLOYMENTS_ENABLED){
            logError('Deployments are disabled. Please add DEPLOYMENTS_ENABLED=true to .env')
        }
        if(!appName){
            logError('Error: missing required argument name|all')
        }
        else if(appName === 'all'){
            const apps = await findAllDeploymentApps()
            for(const app of apps){
                await runDeployment(app)
            }
        }
        else{
            const app = await findOneDeploymentApp(appName)
            if(!app){
                logError(`Error: No deploy hooks found for app : ${appName}`)
            }
            else{
                await runDeployment(app)
            }
        }
    }
    catch(err){
        logError(`Error : ${err.message || err}`)
    }
}

deployNow(process.argv[2])