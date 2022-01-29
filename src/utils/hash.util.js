const crypto = require('crypto');

const getSHA1 = (data, secret) => {
    return crypto
          .createHmac('sha1', secret)
          .update(JSON.stringify(data))
          .digest('hex');
}

module.exports = {
    getSHA1
}