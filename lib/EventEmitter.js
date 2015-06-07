var util = require('util'),
    EventEmitter = require('events').EventEmitter

util.inherits(em, EventEmitter)
function em() {
  if ( !(this instanceof em) ) return new em

  EventEmitter.call(this)
  this._pipes = []
}

em.prototype.emit = function() {
  EventEmitter.prototype.emit.apply(this, arguments)
  for ( var i = 0 ; i < this._pipes.length ; i++ )
    this._pipes[i].emit.apply(this._pipes[i], arguments)
}
em.prototype.pipe = function(emitter) {
  this._pipes.push(emitter)
}
em.prototype.unpipe = function(emitter) {
  if ( ! emitter ) throw new TypeError('EventEmitter required')
  for ( var i = 0 ; i < this._pipes.length ; i++ )
    if ( this._pipes[i] === emitter )
      this._pipes.splice(i, 1)
}

module.exports = exports = em
