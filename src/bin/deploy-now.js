const config = require('../config')
const { logError } = require('../utils/logger.util')
const { runDeployment } = require('../providers/gitops/runner')

const deployNow = async (appName) => {
    if(!config.DEPLOYMENTS_ENABLED){
        logError('Deployments are disabled. Please add DEPLOYMENTS_ENABLED=true to .env')
    }
    if(!appName){
        logError('Error: missing required argument name|all')
    }
    else if(appName === 'all'){
        for(const app of deployHooks.apps){
            await runDeployment(app)
        }
    }
    else{
        const app = deployHooks.apps.find(app => app.name === appName)
        if(!app){
            logError(`Error: No deploy hooks found for app : ${appName}`)
        }
        else{
            await runDeployment(app)
        }
    }
}

deployNow(process.argv[2])