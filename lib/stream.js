var util = require('util'),
    Writable = require('stream').Writable,
    Readable = require('stream').Readable,
    //Buffer = require('buffer'),
    bindexOf = require('buffer-indexof'),
//    {Writable, Readable} = require('stream'),
    //dataType = require('./data'),
    c3ctr        = process.env.c3ctr || 'c3io',
    c3len        = parseInt(process.env.c3len || 1)


function stream(emitter) {
  if ( !emitter )
    throw new TypeError('argument needs to be an EventEmitter')

  this.emitter = emitter
  this._stdout = this._stderr = this._stdin =  null
}

Object.defineProperty(stream.prototype, 'stdin', {
  get: function() {
    if ( this._stdin ) return this._stdin

    this._stdin = Readable()
    this._stdin.setEncoding('utf8')

    this._stdin._read = function(n) {
      //console.warn(arguments)
    }
    return this._stdin
  },
  set: function(res) {
    this._stdin.write(res.toString(), 'utf8')
  }
})
Object.defineProperty(stream.prototype, 'stdout', {
  get: function() {
    if ( this._stdout ) return this._stdout
    this._stdout = Writable()
    this._stdout._write = _write(this.stdout, this.emitter)

    this._stdout.on('error', function() {
      console.warn(arguments)
    })
    this._stdout.on('close', function() {
      console.warn(arguments)
    })
    return this._stdout
  }, writeable: false
})
Object.defineProperty(stream.prototype, 'stderr', {
  get: function() {
    if ( this._stderr ) return this._stderr
    this._stderr = Writable()
    this._stderr._write = _write(this._stderr, this.emitter)

    return this._stderr
  }, writeable: false
})

function _write(stream, emitter) {
  stream.buffer = new Buffer(0)

  return function(chunk, enc, next) {
    var chunk = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc),
        newLineIndex = null

    stream.buffer = Buffer.concat([stream.buffer, chunk])
    if ( (newLineIndex = bindexOf(stream.buffer, new Buffer('\n'))) !== -1 ) { // \033[0G
      var line = stream.buffer.slice(0, newLineIndex).toString('utf8'),
          data = null
      stream.buffer = stream.buffer.slice(newLineIndex + 1)

      try {
        if ( line.slice(0, c3ctr.length) == c3ctr )
          data = emitter.r2d2[line.slice(c3ctr.length, c3len)](line.slice(c3ctr.length + c3len))
      }
      catch(e) { console.warn("[missing c3io.r2d2 type]", line.slice(0, c3ctr.length + c3len)) }

      if ( data === null )
        data = emitter.c3io.r2d2.default(line)

      emitter.emit('message', data)
      stream.buffer = new Buffer(0)
    }
    next()
  }
}

module.exports = exports = stream
