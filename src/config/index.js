require('dotenv').config()

const config = {
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 4343,
    APP_DIR: process.cwd(),
    APP_SESSION_SECRET: process.env.APP_SESSION_SECRET || null,
    APP_USERNAME: process.env.APP_USERNAME || null,
    APP_PASSWORD: process.env.APP_PASSWORD || null,
    SHOW_GIT_INFO: process.env.SHOW_GIT_INFO || false,
    SHOW_ENV_FILE: process.env.SHOW_ENV_FILE || false,
    DEPLOY_HOOKS_ENABLED: process.env.DEPLOY_HOOKS_ENABLED || false,
    DEPLOY_HOOKS_JSON_PATH: process.env.DEPLOY_HOOKS_JSON_PATH || null,
    DEFAULTS: {
        BCRYPT_HASH_ROUNDS: 10,
    },
    SHARED: {
        LINES_PER_REQUEST: 50,
        APP_BASE_URL: process.env.APP_BASE_URL || '/',
    }
}

module.exports = config;