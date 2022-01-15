const config = require('../config')
const RateLimit = require('koa2-ratelimit').RateLimit;
const router = require('@koa/router')();
const { listServices, describeService, reloadService, restartService, stopService } = require('../providers/pm2/api')
const { validateAdminUser } = require('../services/admin.service')
const  { readLogsReverse } = require('../utils/read-logs.util')
const { getCurrentGitBranch, getCurrentGitCommit } = require('../utils/git.util')
const { getEnvFileContent, setEnvFileContent } = require('../utils/env.util')
const { isAuthenticated, checkAuthentication }= require('../middlewares/auth')
const AnsiConverter = require('ansi-to-html');
const ansiConvert = new AnsiConverter();

const loginRateLimiter = RateLimit.middleware({
    interval: 2*60*1000, // 2 minutes
    max: 100,
    prefixKey: '/login' // to allow the bdd to Differentiate the endpoint 
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
        return ctx.redirect('/services')
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
      services
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
        stdout.lines = stdout.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        stderr.lines = stderr.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        return await ctx.render('services/service', {
            service,
            logs: {
                stdout,
                stderr
            }
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
    logs.lines = logs.lines.map(log => {
        return  ansiConvert.toHtml(log)
    }).join('<br/>')
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

module.exports = router;
