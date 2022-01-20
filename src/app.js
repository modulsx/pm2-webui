#!/usr/bin/env node

const config = require('./config')
const { setEnvDataSync } = require('./utils/env.util')
const { generateRandomString } = require('./utils/random.util')
const { runDeploymentsSetup } = require('./providers/gitops/setup')
const path = require('path');
const serve = require('koa-static');
const render = require('koa-ejs');
const koaBody = require('koa-body');
const session = require('koa-session');
const helmet = require('koa-helmet')
const Koa = require('koa');

// Init Application

if(!config.APP_USERNAME || !config.APP_PASSWORD){
    console.log("Admin user not found. Run command -> npm run setup-admin-user")
    process.exit(1)
}

if(!config.APP_SESSION_SECRET){
    const randomString = generateRandomString()
    setEnvDataSync(config.APP_DIR, { APP_SESSION_SECRET: randomString})
    config.APP_SESSION_SECRET = randomString
}

if(config.DEPLOYMENTS_ENABLED){
    runDeploymentsSetup()
}

// Create App Instance
const app = new Koa();

// App Settings
app.proxy = true;
app.keys = [config.APP_SESSION_SECRET];

// Middlewares
app.use(session(app));

app.use(koaBody());

app.use(helmet());

app.use(serve(path.join(__dirname, 'public')));

app.use((ctx, next) => {
    ctx.state = ctx.state || {};
    ctx.state.APP_NAME = config.APP_NAME
    ctx.state.APP_BASE_URL = config.APP_BASE_URL,
    ctx.state.LINES_PER_REQUEST =  config.APP_DEFAULTS.LINES_PER_REQUEST
    ctx.state.USERNAME = ctx.session.username
    return next();
});

const router = require("./routes");
app.use(router.routes());

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'base',
    viewExt: 'html',
    cache: false,
    debug: false,
    async: true
});

app.listen(config.PORT, config.HOST, ()=>{
    console.log(`Application started at http://${config.HOST}:${config.PORT}`)
})