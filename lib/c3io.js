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
    get: function() { return this.stdio[0] },
    set: function(buf) { this.stdio[0].send(buf) }
  })
  Object.defineProperty(this, 'stdout', {
    get: function() { return this.stdio[1] }, writeable: false
  })
  Object.defineProperty(this, 'stderr', {
    get: function() { return this.stdio[2] }, writeable: false
  })
}

c3io.r2d2 = function() {
  Buffer.apply(this, arguments)
  this.stderr = this.stdin = false
}
util.inherits(c3io.r2d2, Buffer)

c3io.r2d2.default = function(_data) {
  var message = function() {
    c3io.r2d2.call(this, _data)

  }
  util.inherits(message, c3io.r2d2)

  return new message;
}

c3io.r2d2.req = function(_data) {
  var request = function() {
    c3io.r2d2.call(this, _data)
    this.stdin = true
  }
  util.inherits(request, c3io.r2d2)

  return new request;
}

/*
stdio.prototype.pipe = function(emitter) {
  this.pipe(emitter)
}
*/
c3io.prototype.c3io = c3io
module.exports = exports = c3io
