$('#pm2-service-reload-btn').on('click', async function(){
    const service_name = window.location.href.split('/')[4]
    await fetch(`/api/services/${service_name}/reload`, { method: 'POST'})
    location.reload();
})


$('#pm2-service-restart-btn').on('click', async function(){
    const service_name = window.location.href.split('/')[4]
    await fetch(`/api/services/${service_name}/restart`, { method: 'POST'})
    location.reload();
})

$('#pm2-service-stop-btn').on('click', async function(){
    const service_name = window.location.href.split('/')[4]
    await fetch(`/api/services/${service_name}/stop`, { method: 'POST'})
    location.reload();
})

function _getActiveServiceLogsData(){
    const data = {
        log_type: $('.service-logs-content.active').attr('id'),
        next_key: $('.service-logs-content.active').attr('data-next-key')
    };
    return data
}
  
async function _fetchLogs(log_type, next_key){
    const service_name = window.location.href.split('/')[4]
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
    else if(action === 'serviceend'){
        $(`#${log_type}`).serviceend('<br/>' + logs.lines)
    }
    else if(action === 'prepend'){
        $(`#${log_type}`).prepend(logs.lines + '<br/>')
    }
}

$('#fetch-more-service-logs-btn').on('click', async function(){
    const { log_type, next_key  } = _getActiveServiceLogsData()
    if(parseInt(next_key) <= 0){
        console.log('End of Logs')
    }
    else{
        const logs  = await _fetchLogs(log_type, next_key)
        if(logs) {
            _setLogsData(log_type, logs, 'prepend')
        }
        else{
            console.log('Unable to fetch logs')
        }
    }
})

$('#refresh-service-logs-btn').on('click', async function(){
    const { log_type } = _getActiveServiceLogsData()
    const logs  = await _fetchLogs(log_type)
    if(logs){
        _setLogsData(log_type, logs, 'refresh')
    }
    else{
        console.log('Unable to fetch logs')
    }
})

$('#service-logs-type').on('change', function() {
    $('.service-logs-content').removeClass('active')
    const logType = $(this).val()
    $(`#${logType}`).addClass('active')
})

$('#save-service-environment-btn').on('click', async function(){
    const service_name = window.location.href.split('/')[4]
    console.log(service_name)
    await fetch(`/api/services/${service_name}/environment`, {
        method: 'POST',
        body: document.EnvEditor.toString()
    })
    location.reload()
})