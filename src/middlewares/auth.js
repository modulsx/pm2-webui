const isAuthenticated = async (ctx, next) => {
    if(ctx.url !== "/login" && !ctx.session.isAuthenticated){
        return ctx.redirect('/login')
    }
    await next()
}

module.exports = isAuthenticated;