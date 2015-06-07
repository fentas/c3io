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
  //this.push(new stream(this.emitter).stderr)

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
/*
stdio.prototype.pipe = function(emitter) {
  this.pipe(emitter)
}
*/
module.exports = exports = c3io
