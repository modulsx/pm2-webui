const isAuthenticated = async (ctx, next) => {
    if(!ctx.url.endsWith("/login") && !ctx.session.isAuthenticated){
        return ctx.redirect('./login')
    }
    else if(ctx.url.endsWith("/login") && ctx.session.isAuthenticated){
        return ctx.redirect('./apps')
    }
    await next()
}

module.exports = isAuthenticated;
