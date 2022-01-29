const RateLimit = require('koa2-ratelimit').RateLimit;
const router = require('@koa/router')();
const { listServices, describeService, reloadService, restartService, stopService } = require('../providers/pm2/api')
const { validateAdminUser } = require('../services/admin.service')
const { readLogsReverse } = require('../utils/read-logs.util')
const { getCurrentGitBranch, getCurrentGitCommit } = require('../utils/git.util')
const { getEnvFileContent, setEnvFileContent } = require('../utils/env.util')
const { isAuthenticated, checkAuthentication }= require('../middlewares/auth')
const { convertAnsiLogsToCssLines } = require('../utils/ansi.util')
const { findAllDeploymentApps, findOneDeploymentApp } = require('../providers/gitops/api')
const { runDeployment } = require('../providers/gitops/runner')
const { validateWebhook } = require('../providers/gitops/webhook-handler')

const loginRateLimiter = RateLimit.middleware({
    interval: 2*60*1000, // 2 minutes
    max: 100,
    prefixKey: '/login' // to allow the bdd to Differentiate the endpoint 
});

const webhookRateLimiter = RateLimit.middleware({
    interval: 1*60*1000, // 1 minute
    max: 100, // Maximum 100 requests for 1 minute
    prefixKey: '/deployments/hooks' // to allow the bdd to Differentiate the endpoint 
});

router.get('/', async (ctx) => {
    return ctx.redirect('/login')
})

router.get('/login', loginRateLimiter, checkAuthentication, async (ctx) => {
    return await ctx.render('auth/login', {layout : false, login: { username: '', password:'', error: null }})
})

router.post('/login', loginRateLimiter, checkAuthentication, async (ctx) => {
    const { username, password } = ctx.request.body;
    try {
        await validateAdminUser(username, password)
        ctx.session.isAuthenticated = true;
        ctx.session.username = username
        return ctx.redirect('/deployments')
    }
    catch(err){
        return await ctx.render('auth/login', {layout : false, login: { username, password, error: err.message }})
    }
})

router.get('/logout', (ctx)=>{
    ctx.session = null;
    return ctx.redirect('/login')
})

router.get('/services', isAuthenticated, async (ctx) => {
    const services =  await listServices()
    return await ctx.render('services/index', {
      services,
      route: 'services'
    });
});

router.get('/services/:serviceName', isAuthenticated, async (ctx) => {
    const { serviceName } = ctx.params
    let service =  await describeService(serviceName)
    if(service){
        service.git_branch = await getCurrentGitBranch(service.pm2_env_cwd)
        service.git_commit = await getCurrentGitCommit(service.pm2_env_cwd)
        service.env_data = await getEnvFileContent(service.pm2_env_cwd)
        const stdout = await readLogsReverse({filePath: service.pm_out_log_path})
        const stderr = await readLogsReverse({filePath: service.pm_err_log_path})
        stdout.lines = convertAnsiLogsToCssLines(stdout.lines)
        stderr.lines = convertAnsiLogsToCssLines(stderr.lines)
        return await ctx.render('services/service', {
            service,
            logs: {
                stdout,
                stderr
            },
            route: `/services/${service.name}`
        });
    }
    return ctx.redirect('/services')
});

router.get('/api/services/:serviceName/logs/:logType', isAuthenticated, async (ctx) => {
    const { serviceName, logType } = ctx.params
    const { linePerRequest, nextKey } = ctx.query
    if(logType !== 'stdout' && logType !== 'stderr'){
        return ctx.body = {
            'error': 'Log Type must be stdout or stderr'
        }
    }
    const service =  await describeService(serviceName)
    const filePath = logType === 'stdout' ? service.pm_out_log_path: service.pm_err_log_path
    let logs = await readLogsReverse({filePath, nextKey})
    logs.lines = convertAnsiLogsToCssLines(logs.lines)
    return ctx.body = {
        logs
    };
});

router.post('/api/services/:serviceName/reload', isAuthenticated, async (ctx) => {
    try{
        let { serviceName } = ctx.params
        let services =  await reloadService(serviceName)
        if(Array.isArray(services) && services.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/services/:serviceName/restart', isAuthenticated,  async (ctx) => {
    try{
        let { serviceName } = ctx.params
        let services =  await restartService(serviceName)
        if(Array.isArray(services) && services.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        console.log(err)
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/services/:serviceName/stop', isAuthenticated, async (ctx) => {
    try{
        let { serviceName } = ctx.params
        let services =  await stopService(serviceName)
        if(Array.isArray(services) && services.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/services/:serviceName/environment', isAuthenticated, async (ctx) => {
    try{
        const { serviceName } = ctx.params
        const envData = ctx.request.body
        const service =  await describeService(serviceName)
        if(service){
            await setEnvFileContent(service.pm2_env_cwd, envData)
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        console.log(err)
        return ctx.body = {
            'error':  err
        }
    }
});

router.get('/deployments', isAuthenticated, async (ctx) => {
    let apps =  await findAllDeploymentApps() || []
    apps = apps.map(app => {
        const { build_command, ...rest } = app
        const updatedBuildCommand = [].concat(build_command).join(' && ')
        const webhook_url = `api/deployments/hooks/${app.name}`
        return { ...rest, build_command: updatedBuildCommand, webhook_url }
    })
    const deployments_config =  JSON.stringify({ apps }, null, 4)
    return await ctx.render('deployments/index', {
        apps,
        deployments_config,
        route: 'deployments'
    });
});

router.post('/api/deployments/trigger/:appName', webhookRateLimiter, async (ctx) => {
    const { appName } = ctx.params
    try{
        const app = await findOneDeploymentApp(appName)
        if(!app){
            return ctx.body = {
                'error':  'App not found'
            }
        }
        else{
            runDeployment(app, { force: true})
            return ctx.body = {
                message: 'Deployment Started'
            }
        }
    }
    catch(err){
        console.log(err)
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/deployments/hooks/:appName', webhookRateLimiter, async (ctx) => {
    const { appName } = ctx.params
    console.log('Recived Webhook For', appName)
    try{
        const app = await findOneDeploymentApp(appName)
        const isValidWebhook = validateWebhook(app, ctx.request.header, ctx.request.body)
        if(isValidWebhook){
            console.log('Webhook Validation Successful For', appName)
            runDeployment(app)
            return ctx.status = 200
        }
        else{
            console.log('Webhook Validation Failed For', appName)
            return ctx.status = 400
        }
    }
    catch(err){
        console.log(err)
        return ctx.status = 500
    }
});

module.exports = router;
