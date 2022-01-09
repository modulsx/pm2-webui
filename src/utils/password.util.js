const bcrypt = require('bcryptjs');
const config = require('../config')

const hashPasswordSync = (password) => {
    return bcrypt.hashSync(password, config.DEFAULTS.BCRYPT_HASH_ROUNDS)
}

const hashPassword = async (password) => {
    return bcrypt.hash(password, config.DEFAULTS.BCRYPT_HASH_ROUNDS)
}

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash)
}

module.exports = {
    hashPasswordSync,
    comparePassword,
}