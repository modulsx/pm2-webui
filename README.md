### PM2 WebUI
Opensource Alternative to PM2 Plus

##### FEATURES
- Secure Login :white_check_mark:
- App Management :white_check_mark:
- Log Viewer :white_check_mark:
- Responsive UI :white_check_mark:
- Manual and Auto(Github webhooks) Deployment
- Environment Management

##### USAGE
```
git clone https://github.com/suryamodulus/pm2-webui
cd pm2-webui
npm install
cp env.example .env
npm run setup-admin-user (Required for login)
npm start
```
##### FOR DEVELOPMENT USE
```
npm run start:dev
```

#### TODO
- [ ] support for relative paths
- [ ] use fs-extra for filesystem operations
- [ ] use [jsonfile](https://www.npmjs.com/package/jsonfile) for config management
- [ ] replace exec.util with [execa](https://www.npmjs.com/package/execa)
- [ ] add form based env management
- [ ] add realtime logs
- [ ] add log viewer for deployments
- [ ] add deployment abort functionality
- [ ] add deployment triggers
- [ ] add web terminal
- [ ] add zero downtime deployment strategies - blue-green, rolling etc
- [ ] add docker provider*

##### SCREENSHOTS
![PM2 Webui Login](/screenshots/login.png?raw=true "PM2 WebUI Login")
![PM2 Webui Dashboard](/screenshots/dashboard.png?raw=true "PM2 WebUI Dashboard")
![PM2 Webui App](/screenshots/app.png?raw=true "PM2 WebUI App")

##### LICENSE
MIT - Copyright (c) 2022 Surya T
