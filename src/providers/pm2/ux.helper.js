const bytesToSize = function(bytes, precision) {
    var kilobyte = 1024
    var megabyte = kilobyte * 1024
    var gigabyte = megabyte * 1024
    var terabyte = gigabyte * 1024
  
    if ((bytes >= 0) && (bytes < kilobyte)) {
      return bytes + 'b '
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
      return (bytes / kilobyte).toFixed(precision) + 'kb '
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
      return (bytes / megabyte).toFixed(precision) + 'mb '
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
      return (bytes / gigabyte).toFixed(precision) + 'gb '
    } else if (bytes >= terabyte) {
      return (bytes / terabyte).toFixed(precision) + 'tb '
    } else {
      return bytes + 'b '
    }
}

const timeSince = function(date) {
    var seconds = Math.floor((new Date() - date) / 1000)
  
    var interval = Math.floor(seconds / 31536000)
  
    if (interval > 1) {
      return interval + ' yrs'
    }
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) {
      return interval + ' months'
    }
    interval = Math.floor(seconds / 86400)
    if (interval > 1) {
      return interval + ' days'
    }
    interval = Math.floor(seconds / 3600)
    if (interval > 1) {
      return interval + ' hrs'
    }
    interval = Math.floor(seconds / 60)
    if (interval > 1) {
      return interval + ' minutes'
    }
    return Math.floor(seconds) + ' seconds'
}

module.exports = {
    bytesToSize,
    timeSince
}