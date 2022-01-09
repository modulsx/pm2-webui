const config = require('../config')
const { setEnvDataSync } = require('../utils/env.util')
const { hashPasswordSync, comparePassword } = require('../utils/password.util')

const createAdminUser = (username, password) => {
    const adminUser = {
        APP_USERNAME: username,
        APP_PASSWORD: hashPasswordSync(password)
    }
    setEnvDataSync(config.APP_DIR, adminUser)
}

const validateAdminUser = async (username, password) => {
    if(username !== config.APP_USERNAME){
        throw new Error('User does not exist')
    }
    const isPasswordCorrect = await comparePassword(password, config.APP_PASSWORD)
    if(!isPasswordCorrect){
        throw new Error('Password is incorrect')
    }
    return true
}

module.exports = {
    createAdminUser,
    validateAdminUser
}