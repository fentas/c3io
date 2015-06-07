var util = require('util')
    Readable = require('stream').Readable

function message() {
  
}
message.prototype.push = function(data) {

}

util.inherits(message, Readable)
module.exports = exports = message
