const config = require('../config')
const RateLimit = require('koa2-ratelimit').RateLimit;
const router = require('@koa/router')();
const { listApps, describeApp, getAppLogs, reloadApp, restartApp, stopApp } = require('../providers/pm2')
const { bytesToSize, timeSince } = require('../helpers/ux.helper')
const isAuthenticated = require('../middlewares/auth')
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

router.get('/login', loginRateLimiter, isAuthenticated, async (ctx) => {
    return await ctx.render('auth/unlock', {layout : false})
})

router.post('/login', loginRateLimiter, isAuthenticated, async (ctx) => {
    const { password } = ctx.request.body;
    if(password && password === config.APP_PASSWORD){
        ctx.session.isAuthenticated = true;
        return ctx.redirect('/apps')
    }
    return ctx.redirect('/login')
})

router.get('/apps', isAuthenticated, async (ctx) => {
    let apps =  await listApps()
    apps = apps.map((app) => {
        return {
            name: app.name,
            status: app.pm2_env.status,
            cpu: app.monit.cpu,
            memory: bytesToSize(app.monit.memory),
            uptime: timeSince(app.pm2_env.pm_uptime),
            pm_id: app.pm_id
        }
    })
    return await ctx.render('apps/dashboard', {
      apps
    });
});
  

router.get('/apps/:appName', isAuthenticated, async (ctx) => {
    const { appName } = ctx.params
    let apps =  await describeApp(appName)
    if(Array.isArray(apps) && apps.length > 0){
        const app = {
            name: apps[0].name,
            status: apps[0].pm2_env.status,
            cpu: apps[0].monit.cpu,
            memory: bytesToSize(apps[0].monit.memory),
            uptime: timeSince(apps[0].pm2_env.pm_uptime),
            pm_id: apps[0].pm_id, 
            pm_out_log_path: apps[0].pm2_env.pm_out_log_path,
            pm_err_log_path: apps[0].pm2_env.pm_err_log_path,
        }
        let stdout = await getAppLogs({file_path: app.pm_out_log_path})
        let stderr = await getAppLogs({file_path: app.pm_err_log_path})
        stdout.lines = stdout.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        stderr.lines = stderr.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        const logs = {
            stdout,
            stderr
        }
        return await ctx.render('apps/app', {
            app,
            logs
        });
    }
    return ctx.redirect('/apps')
});

router.get('/api/apps/:appName/logs/:logType/:pageNumber', isAuthenticated, async (ctx) => {
    let { appName, logType, pageNumber} = ctx.params
    if(logType !== 'stdout' && logType !== 'stderr'){
        return ctx.body = {
            'error': 'Log Type must be stdout or stderr'
        }
    }
    let apps =  await describeApp(appName)
    if(Array.isArray(apps) && apps.length > 0){
        let logs = []
        if(logType === 'stdout'){
            logs = await getAppLogs({file_path: apps[0].pm2_env.pm_out_log_path, page_number: pageNumber})
        }
        else{
            logs = await getAppLogs({file_path: apps[0].pm2_env.pm_err_log_path, page_number: pageNumber})
        }
        logs.lines = logs.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        return ctx.body = {
            logs
        };
    }
    return ctx.body = {
        'error': 'App Not Found'
    }
});

router.post('/api/apps/:appName/reload', isAuthenticated, async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await reloadApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
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

router.post('/api/apps/:appName/restart', isAuthenticated,  async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await restartApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
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

router.post('/api/apps/:appName/stop', isAuthenticated, async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await stopApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
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

router.get('/logout', (ctx)=>{
    ctx.session = null;
    return ctx.redirect('/login')
})

module.exports = router;