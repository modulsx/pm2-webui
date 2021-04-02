const { serverConfig } = require('./config')
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const render = require('koa-ejs');
const router = require('@koa/router')();
const koaBody = require('koa-body');

const { listApps, describeApp, getAppLogs } = require('./providers/pm2')
const { bytesToSize, timeSince } = require('./helpers/ux.helper')
var AnsiConverter = require('ansi-to-html');
var ansiConvert = new AnsiConverter();

// Init Application
const app = new Koa();

// App Settings
app.proxy = true;

// Middlewares
app.use(koaBody());

app.use(serve(path.join(__dirname, 'public')));

app.use(router.routes());

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'base',
    viewExt: 'html',
    cache: false,
    debug: false
});

router.get('/', async (ctx, next) => {
    return ctx.redirect('/apps')
})

router.get('/apps', async (ctx, next) => {
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
    return await ctx.render('apps/index', {
      apps
    });
});
  

router.get('/apps/:appName', async (ctx, next) => {
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

router.get('/api/apps/:appName/logs/:logType/:pageNumber', async (ctx, next) => {
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

app.listen(serverConfig.PORT, serverConfig.HOST, ()=>{
    console.log(`Application started at http://${serverConfig.HOST}:${serverConfig.PORT}`)
})