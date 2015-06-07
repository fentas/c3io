var util = require('util'),
    stream  = require('./stream'),
    EventEmitter = require('./EventEmitter')


util.inherits(c3io, EventEmitter)
function c3io() {
  if ( ! this instanceof c3io )
    return new c3io

  EventEmitter.call(this)

  this.stdio = []
  this.stdio.push(new stream(this).stdin)
  this.stdio.push(new stream(this).stdout)
  this.stdio.push(new stream(this).stderr)

  Object.defineProperty(this, 'stdin', {
    get: function() { return this.stdio[0] }
  })
  Object.defineProperty(this, 'stdout', {
    get: function() { return this.stdio[1] }
  })
  Object.defineProperty(this, 'stderr', {
    get: function() { return this.stdio[2] }
  })
}

c3io.r2d2 = function() {
  Buffer.apply(this, arguments)
  this.isStream = false
  this.isError  = false
}
util.inherits(c3io.r2d2, Buffer)

c3io.r2d2.default = function(_data) {
  var message = function() {
    c3io.r2d2.call(this, _data)

  }
  util.inherits(message, c3io.r2d2)

  return new message;
}

/*
stdio.prototype.pipe = function(emitter) {
  this.pipe(emitter)
}
*/
c3io.prototype.c3io = c3io
module.exports = exports = c3io
