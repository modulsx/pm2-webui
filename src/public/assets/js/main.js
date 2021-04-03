async function pm2AppAction(appName, action){
    await fetch(`/api/apps/${appName}/${action}`, { method: 'POST'})
    location.reload();
}