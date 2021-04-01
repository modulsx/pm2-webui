const { listApps } = require('./plugins/pm2')

async function main(){
    const list  = await listApps()
    list.forEach(element => {
        console.log(element.name)
    });
}

main()