const config = require('../config')
const { runDeployment } = require('../providers/gitops/runner')
const { findAllDeploymentApps, findOneDeploymentApp } = require('../providers/gitops/api')

const deployNow = async (appName) => {
    const options = {
        force: true
    }
    try {
        if(!config.DEPLOYMENTS_ENABLED){
            console.error('Deployments are disabled. Please add DEPLOYMENTS_ENABLED=true to .env')
        }
        if(!appName){
            console.error('Error: missing required argument name|all')
        }
        else if(appName === 'all'){
            const apps = await findAllDeploymentApps()
            for(const app of apps){
                await runDeployment(app, options)
            }
        }
        else{
            const app = await findOneDeploymentApp(appName)
            if(!app){
                console.error(`Error: No deploy hooks found for app : ${appName}`)
            }
            else{
                await runDeployment(app, options)
            }
        }
    }
    catch(err){
        console.error(err.message || err)
    }
}

deployNow(process.argv[2])