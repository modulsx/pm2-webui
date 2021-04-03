const config = require('./config')
const path = require('path');
const serve = require('koa-static');
const render = require('koa-ejs');
const koaBody = require('koa-body');
const session = require('koa-session');
const Koa = require('koa');

// Init Application
if(!config.SESSION_SECRET){
    console.log("SESSION_SECRET variable not found in environment. Please add it to .env file :)")
    process.exit(2)
}

if(!config.APP_PASSWORD){
    console.log("APP_PASSWORD variable not found in environment. Please add it to .env file :)")
    process.exit(2)
}

const app = new Koa();

// App Settings
app.proxy = true;
app.keys = [config.SESSION_SECRET];

// Middlewares
app.use(session(app));

app.use(koaBody());

app.use(serve(path.join(__dirname, 'public')));

const router = require("./routes");
app.use(router.routes());

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'base',
    viewExt: 'html',
    cache: false,
    debug: false
});

app.listen(config.PORT, config.HOST, ()=>{
    console.log(`Application started at http://${config.HOST}:${config.PORT}`)
})