function getAppName(element){
    return $(element).closest('.data-store').attr('data-app-name')
}

$('.deployments-app-trigger-btn').on('click', async function(){
    const appName = getAppName(this)
    await fetch(`/api/deployments/trigger/${appName}`, { method: 'POST'}).finally()
    // window.location.reload()
    // Temp work around for logs view
    window.location.href = '/services/stackbase';
})

$(document).ready(function() {
    const element = $('.deployments-app-webhook-url')
    const APP_BASE_URL = $(element).attr('data-app-base-url') || window.origin
    const WEBHOOK_URL = $(element).text()
    $(element).text(`${APP_BASE_URL}/${WEBHOOK_URL}`)
});