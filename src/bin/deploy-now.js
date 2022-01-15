const config = require('../config')
const { logError } = require('../utils/logger.util')
const { runDeployment } = require('../providers/gitops/runner')
const { deployHooksSchema } = require('../validations/deploy-hooks.validation')

if(!config.DEPLOY_HOOKS_JSON_PATH){
    console.error('deploy-hooks.json path is required in .env')
    process.exit(2)
}
const deployHooks = require(config.DEPLOY_HOOKS_JSON_PATH)
const { error } = deployHooksSchema.validate(deployHooks)
if(error){
    logError(`Deploy hooks validation error: ${error.message}`)
    process.exit(2)
}

const deployNow = async (appName) => {
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