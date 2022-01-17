const { execCommand } = require('../../utils/exec.util') 
const { describeService } = require('../pm2/api')
const { logSuccess, logError, logInfo } = require('../../utils/logger.util')

const runDeployment = async (app) => {
    try {
        const cwd = app.path
        logSuccess('Deployment Started', { prefix: app.name, timestamp: true })
        await execCommand(`git fetch ${app.git_branch}`, { prefix: app.name, cwd })
        await execCommand(`git checkout ${app.git_branch}`, { prefix: app.name, cwd })
        await execCommand(`git reset --hard ${app.git_remote}/${app.git_branch}`, { prefix: app.name, cwd })
        const { stdout: git_pull_stdout }  = await execCommand(`git pull ${app.git_remote} ${app.git_branch}`, { prefix: app.name, cwd })
        if(git_pull_stdout.trim().includes('Already up to date')){
            logSuccess('No changes to deploy. Bye bye!', { prefix: app.name, timestamp: true })
        }
        else{
            if(app.exec_commands){
                for(const command of app.exec_commands){
                    const { stdout } = await execCommand(command , { prefix: app.name, cwd })
                    logInfo(stdout, { prefix: app.name, timestamp: true })
                }
            }
            const pm2Service = await describeService(app.name)
            if(pm2Service){
                await execCommand(`pm2 restart ${pm2Service.name}`, { prefix: app.name })
            }
            logSuccess('Deployment completed', { prefix: app.name, timestamp: true })
        }
    }
    catch(err){
        logError(err, { prefix: app.name, timestamp: true })
    }
}

module.exports = {
    runDeployment
}