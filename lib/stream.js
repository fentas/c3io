var util = require('util'),
    Writable = require('stream').Writable,
    Readable = require('stream').Readable,
    //Buffer = require('buffer'),
    bindexOf = require('buffer-indexof'),
//    {Writable, Readable} = require('stream'),
    //dataType = require('./data'),
    c3ctr        = process.env.c3ctr || 'c3io!',
    c3len        = parseInt(process.env.c3len || 3)

//TODO: do it better.. with c3docker stdin input will be passed to stdout. guess: usage of duplexStream.
var _stdin_ignore = null

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

    var _this = this
    this._stdin._read = function(n) { }
    this._stdin.send = function(buf) {
      this.push(_stdin_ignore = Buffer.concat([
        Buffer.isBuffer(buf) ? buf : new Buffer(buf),
        new Buffer('\r')]))
    }
    return this._stdin
  },
  writeable: false
})
Object.defineProperty(stream.prototype, 'stdout', {
  get: function() {
    if ( this._stdout ) return this._stdout
    this._stdout = Writable()
    this._stdout._write = _write.call(this._stdout, this.emitter)

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
    this._stderr._isErr = true
    this._stderr._write = _write.call(this._stderr, this.emitter)

    return this._stderr
  }, writeable: false
})

function _write(emitter) {
  this.buffer = new Buffer(0)

  return function(chunk, enc, next) {
    var chunk = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc),
        newLineIndex = null

    this.buffer = Buffer.concat([this.buffer, chunk])
    while ( (newLineIndex = bindexOf(this.buffer, new Buffer('\n'))) !== -1 ) {//console.log('foo',chunk.toString('utf8'),'bar', newLineIndex) // \033[0G
      var line = this.buffer.slice(0, newLineIndex),
          data = null
      this.buffer = this.buffer.slice(newLineIndex + 1)

      //see latter todo
      if ( _stdin_ignore && line.equals(_stdin_ignore) ) { _stdin_ignore = null; continue }

      line = line.toString('utf8').trim()
      // skip empty lines
      if ( line.length === 0 ) continue

      try {
        if ( line.slice(0, c3ctr.length) == c3ctr )
          data = emitter.c3io.r2d2[line.slice(c3ctr.length, c3ctr.length + c3len)].call(emitter, line.slice(c3ctr.length + c3len))
      }
      catch(e) { console.warn("[missing c3io.r2d2 type]", line.slice(0, c3ctr.length + c3len), e) }

      if ( data === null )
        data = emitter.c3io.r2d2.default.call(emitter, line)

      // nothing to pass on
      if ( ! data ) return next();

      this._isErr ? emitter.emit('stderr', data) : emitter.emit('stdout', data)
      data.stdin && emitter.emit('stdin', data)

      data.stderr = this._isErr ? true : false
      emitter.emit('message', data)
    }
    next()
  }
}

module.exports = exports = stream
