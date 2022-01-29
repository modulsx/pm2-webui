const path = require('path')
const fs = require('fs/promises')
const { execCommand } = require('../../utils/exec.util') 
const { describeService } = require('../pm2/api')
const FileLogger = require('../../utils/file-logger.util')

const runDeployment = async (app, options = {}) => {
    const logger = new FileLogger({appName: app.name, timestamp: true, stdio: true})
    try {
        const cwd = path.join(app.deploy_path, app.name)
        let isNewRepo = false
        logger.success('*** Deployment Started ***')
        await fs.access(cwd).catch(async (err) => {
            if(err.code === 'ENOENT'){
                isNewRepo = true
            }
            else{
                throw new Error(err.message || err)
            }
        })
        if(isNewRepo){
            await execCommand(`git clone ${app.git_remote_url} ${cwd}`, { logger: logger })
        }
        await execCommand(`git fetch origin ${app.git_branch}`, { logger: logger, cwd })
        await execCommand(`git checkout ${app.git_branch}`, { logger: logger, cwd })
        await execCommand(`git reset --hard origin/${app.git_branch}`, { logger: logger, cwd })
        const { stdout: git_pull_stdout }  = await execCommand(`git pull origin ${app.git_branch}`, { logger: logger, cwd })
        // if(git_pull_stdout.trim().toLowerCase().includes('already up to date') && !isNewRepo && !options.force){
        //     logger.success('No Changes To Deploy. Bye Bye')
        //     return 0;
        // }
        if(app.build_command){
            for(const command of [].concat(app.build_command)){
                await execCommand(command , { logger: logger, cwd, verbose: true })
            }
        }
        if(app.runtime === 'pm2'){
            const pm2Service = await describeService(app.name)
            if(pm2Service){
                logger.log('PM2 App Found, Restarting Now')
                await execCommand(`pm2 restart ${pm2Service.name}`, { logger: logger })
            }
            else{
                logger.log('Starting New PM2 App')
                const command = app.start_command.replace(/\ /,' -- ')
                await execCommand(`pm2 start --cwd ${cwd} --name ${app.name} ${command}`, { logger: logger })
            }
        }
        logger.success('*** Deployment Completed ***')
    }
    catch(err){
        logger.error(err)
        // git rev-parse main@{1} - if failed, revert to back previous commit
    }
    logger.close()
}

module.exports = {
    runDeployment,
}