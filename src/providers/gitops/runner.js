const path = require('path')
const fs = require('fs/promises')
const { execCommand } = require('../../utils/exec.util') 
const { describeService } = require('../pm2/api')
const FileLogger = require('../../utils/file-logger.util')

const runDeployment = async (app, options = {}) => {
    const logger = new FileLogger({appName: app.name, timestamp: true})
    try {
        const cwd = path.join(app.working_dir, app.name)
        let isNewRepo = false
        logger.success('Deployment Started')
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
        await execCommand(`git fetch ${app.git_remote_name} ${app.git_branch}`, { logger: logger, cwd })
        await execCommand(`git checkout ${app.git_branch}`, { logger: logger, cwd })
        await execCommand(`git reset --hard ${app.git_remote_name}/${app.git_branch}`, { logger: logger, cwd })
        const { stdout: git_pull_stdout }  = await execCommand(`git pull ${app.git_remote_name} ${app.git_branch}`, { logger: logger, cwd })
        if((git_pull_stdout.trim().includes('Already up to date') && !isNewRepo) || !!options.force){
            logger.success('No changes to deploy. Bye bye!')
            return 0;
        }
        if(app.pre_deploy){
            for(const command of [].concat(app.pre_deploy)){
                await execCommand(command , { logger: logger, cwd, verbose: true })
            }
        }
        await execCommand(app.deploy , { logger: logger, cwd, verbose: true })
        if(app.post_deploy){
            for(const command of [].concat(app.post_deploy)){
                await execCommand(command , { logger: logger, cwd, verbose: true })
            }
        }
        const pm2Service = await describeService(app.name)
        if(pm2Service){
            logger.log('PM2 Service Found')
            await execCommand(`pm2 restart ${pm2Service.name}`, { logger: logger })
        }
        logger.success('Deployment completed')
    }
    catch(err){
        logger.error(err)
    }
    logger.close()
}

module.exports = {
    runDeployment,
}