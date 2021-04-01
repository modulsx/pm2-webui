require('dotenv').config()

const serverConfig = {
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 4343
}

module.exports = { serverConfig };