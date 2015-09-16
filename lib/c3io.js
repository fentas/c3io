var util = require('util'),
    stream  = require('./stream'),
    EventEmitter = require('./EventEmitter')

function extend(target) {
    var sources = [].slice.call(arguments, 1)
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop]
        }
    })
    return target
}

util.inherits(c3io, EventEmitter)
function c3io(options) {
  if ( ! this instanceof c3io )
    return new c3io(options)

  EventEmitter.call(this)

  this.options = extend({}, c3io.options, options)
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

  if ( this.options.stdio !== null ) {
    switch ( typeof this.options.stdio ) {
      case 'object':
        if ( this.options.stdio.stdout ) this.options.stdio.stdout.pipe(this.stdio[1])
        if ( this.options.stdio.stderr ) this.options.stdio.stderr.pipe(this.stdio[2])
        if ( this.options.stdio.stdin ) this.stdio[0].pipe(this.options.stdio.stdin)
        break;
      case 'array':
        if ( this.options.stdio[1] ) this.options.stdio[0].stdout.pipe(this.stdio[1])
        if ( this.options.stdio[2] ) this.options.stdio[1].stderr.pipe(this.stdio[2])
        if ( this.options.stdio[0] ) this.stdio[0].pipe(this.options.stdio[2])
        break;
    }
  }

  return this
}

c3io.options = {
  protocol: 'newline',
  stdio: null
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
