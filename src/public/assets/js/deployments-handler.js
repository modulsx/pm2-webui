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
    const APP_BASE_URL = $(element).attr('data-app-base-url') || window.origin
    $(".deployments-app-webhook-url").each(function() {
        $(this).text(`${APP_BASE_URL}/${$(this).text()}`)
    });
});