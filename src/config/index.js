require('dotenv').config()

const config = {
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 4343,
    SESSION_SECRET: process.env.SESSION_SECRET || null,
    APP_PASSWORD: process.env.APP_PASSWORD || null,
    DEFAULTS: {
        LINES_PER_REQUEST: 50
    }
}

module.exports = config;