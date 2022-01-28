require('dotenv').config()
const path = require('path')

const config = {
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 4343,
    APP_NAME: process.env.APP_NAME || 'PM2 WebUI',
    APP_BASE_URL: process.env.APP_BASE_URL || '',
    APP_DIR: process.cwd(),
    APP_SESSION_SECRET: process.env.APP_SESSION_SECRET || null,
    APP_USERNAME: process.env.APP_USERNAME || null,
    APP_PASSWORD: process.env.APP_PASSWORD || null,
    DEPLOYMENTS_ENABLED: process.env.DEPLOYMENTS_ENABLED || false,
    DEPLOYMENTS_LOGS_DIR: process.env.DEPLOYMENTS_LOGS_DIR || path.join(process.cwd(), 'logs'),
    DEPLOYMENTS_CONFIG_PATH: process.env.DEPLOYMENTS_CONFIG_PATH || path.join(process.cwd(), 'deployments.config.json'),
    APP_DEFAULTS: {
        BCRYPT_HASH_ROUNDS: 10,
        LINES_PER_REQUEST: 50,
    },
}

module.exports = config;