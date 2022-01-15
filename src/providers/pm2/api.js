const pm2 = require('pm2');
const { bytesToSize, timeSince } = require('./ux.helper')

function listServices(){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.list((err, services) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                services = services.map((service) => {
                    return {
                        name: service.name,
                        status: service.pm2_env.status,
                        cpu: service.monit.cpu,
                        memory: bytesToSize(service.monit.memory),
                        uptime: timeSince(service.pm2_env.pm_uptime),
                        pm_id: service.pm_id
                    }
                })
                resolve(services)
            })
        })
    })
}

function describeService(serviceName){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.describe(serviceName, (err, services) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                if(Array.isArray(services) && services.length > 0){
                    const service = {
                        name: services[0].name,
                        status: services[0].pm2_env.status,
                        cpu: services[0].monit.cpu,
                        memory: bytesToSize(services[0].monit.memory),
                        uptime: timeSince(services[0].pm2_env.pm_uptime),
                        pm_id: services[0].pm_id, 
                        pm_out_log_path: services[0].pm2_env.pm_out_log_path,
                        pm_err_log_path: services[0].pm2_env.pm_err_log_path,
                        pm2_env_cwd: services[0].pm2_env.pm_cwd
                    }
                    resolve(service)
                }
                else{
                    resolve(null)
                }
            })
        })
    })
}

function reloadService(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.reload(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function stopService(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.stop(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function restartService(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.restart(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

module.exports = {
    listServices,
    describeService,
    reloadService,
    stopService,
    restartService
}

