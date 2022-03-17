function getServiceName(element){
    return $(element).closest('.data-store').attr('data-service-name')
}

$('.pm2-service-reload-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    await fetch(`/api/services/${serviceName}/reload`, { method: 'POST'})
    window.location.reload();
})

$('.pm2-service-restart-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    await fetch(`/api/services/${serviceName}/restart`, { method: 'POST'})
    window.location.reload();
})

$('.pm2-service-stop-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    await fetch(`/api/services/${serviceName}/stop`, { method: 'POST'})
    window.location.reload();
})

function _getActiveServiceLogsData(){
    const data = {
        log_type: $('.service-logs-content.active').attr('id'),
        next_key: $('.service-logs-content.active').attr('data-next-key')
    };
    return data
}
  
async function _fetchLogs(service_name, log_type, next_key){
    const response = await fetch(`/api/services/${service_name}/logs/${log_type}${next_key?`?nextKey=${next_key}`: ''}`)
    const data = await response.json()
    if(data && data.logs){
        return data.logs
    }
    return null
}

function _setLogsData(log_type, logs, action){
    $(`#${log_type}`).attr('data-next-key', logs.nextKey)
    if(action === 'refresh'){
        $(`#${log_type}`).html(logs.lines)
    }
    else if(action === 'prepend'){
        $(`#${log_type}`).prepend(logs.lines + '<br/>')
    }
}

$('#fetch-older-service-logs-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    const { log_type, next_key  } = _getActiveServiceLogsData()
    if(parseInt(next_key) <= 0){
        console.log('End of Logs')
    }
    else{
        const logs  = await _fetchLogs(serviceName, log_type, next_key)
        if(logs) {
            _setLogsData(log_type, logs, 'prepend')
        }
        else{
            console.log('Unable to fetch older logs')
        }
    }
})

$('#refresh-service-logs-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    const { log_type } = _getActiveServiceLogsData()
    const logs  = await _fetchLogs(serviceName, log_type)
    if(logs){
        _setLogsData(log_type, logs, 'refresh')
    }
    else{
        console.log('Unable to refresh logs')
    }
})

$('#service-logs-type').on('change', function() {
    $('.service-logs-content').removeClass('active')
    const logType = $(this).val()
    $(`#${logType}`).addClass('active')
})

$('#save-service-environment-btn').on('click', async function(){
    const serviceName = getServiceName(this)
    await fetch(`/api/services/${serviceName}/environment`, {
        method: 'POST',
        body: document.EnvEditor.toString()
    })
    window.location.reload();
})