var crypto = require("crypto");

const generateRandomString  = (len = 20) => {
    return crypto.randomBytes(len).toString('hex');
}

module.exports = {
    generateRandomString
}