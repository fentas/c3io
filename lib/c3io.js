var util = require('util'),
    stream  = require('./stream'),
    EventEmitter = require('./EventEmitter'),
    on = {}

function extend(target) {
  var sources = [].slice.call(arguments, 1)
  sources.forEach(function (source) {
    for (var prop in source) {
      if ( typeof target[prop] == 'object' ) {
        extend(target[prop], source[prop])
      }else
        target[prop] = source[prop]
    }
  })
  return target
}

util.inherits(c3io, EventEmitter)
function c3io(options) {
  if ( ! (this instanceof c3io) )
    return new c3io(options)

  EventEmitter.call(this)

  extend(this, c3io.options, options)
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

  for ( var type in on ) {
    for ( var i = 0 ; i < on[type].length ; i++ )
      this.on(type, on[type][i])
  }

  return this
}

c3io.options = {
  protocol: 'newline',
  stdio: null,

  r2d2: {
    req: function(_data) {
      _data.stdin = true
      return _data
    }
  }
}
c3io.on = function(type, func) {
  if ( typeof func === 'function' ) {
    if ( ! on[type] ) on[type] = []
    on[type].push(func)
  }
  else delete on[type]
}

c3io.prototype.pipe = function(stdio) {
  switch ( typeof stdio ) {
    case 'object':
      if ( stdio.stdout ) stdio.stdout.pipe(this.stdio[1])
      if ( stdio.stderr ) stdio.stderr.pipe(this.stdio[2])
      if ( stdio.stdin ) this.stdio[0].pipe(stdio.stdin)
      break;
    case 'array':
      if ( stdio[1] ) stdio[0].stdout.pipe(this.stdio[1])
      if ( stdio[2] ) stdio[1].stderr.pipe(this.stdio[2])
      if ( stdio[0] ) this.stdio[0].pipe(stdio[2])
      break;
  }
  return this
}
/*
stdio.prototype.pipe = function(emitter) {
  this.pipe(emitter)
}
*/
module.exports = exports = c3io
