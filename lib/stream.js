var util = require('util'),
    Writable = require('stream').Writable,
    Readable = require('stream').Readable,
    //Buffer = require('buffer'),
//    {Writable, Readable} = require('stream'),
    //dataType = require('./data'),
    c3ctr        = process.env.c3ctr || 'c3io!',
    c3len        = parseInt(process.env.c3len || 3)

function bufferIndexOf(buf, search, offset) {
  offset = offset || 0
  var m = 0, s = -1
  for ( var i = offset ; i < buf.length ; ++i ) {
    if ( buf[i] != search[m] ) { s = -1; m = 0; }
    if(buf[i] == search[m]) {
      if(s == -1) s = i;
      if(++m == search.length) break;
    }
  }
  if (s > -1 && buf.length - s < search.length) return -1;
  return s;
}

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

    this._stdin = Readable() //require('stream').PassThrough()//
    this._stdin.writeable = false
    this._stdin.setEncoding('utf8')

    var _this = this
    this._stdin._read = function noop() { }
    this._stdin.send = function(buf) {
      buf = Buffer.isBuffer(buf) ? buf : Buffer(buf)
      if ( _this.emitter.protocol == 'native' ) {
        var length = Buffer(4)
        length.writeInt32LE(buf.length, 0)
        this.push(length)
        _stdin_ignore = buf
      }
      else _stdin_ignore = Buffer.concat([buf, Buffer('\r')])
      this.push(_stdin_ignore)
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
  this.buffer = Buffer(0)

  function processInput(data) {
    if ( typeof emitter.r2d2.c3po === 'function' )
      data = emitter.r2d2.c3po.call(emitter, data, c3ctr.length + c3len, c3ctr)

    if ( data instanceof Buffer && data.slice(0, c3ctr.length).toString('utf8') === c3ctr ) {
      var type = data.slice(c3ctr.length, c3ctr.length + c3len).toString('utf8')

      if ( typeof emitter.r2d2[type] === 'function' )
        data = emitter.r2d2[type].call(emitter, data.slice(c3ctr.length + c3len))
      else
        console.warn("[missing c3io.r2d2 type]", type)
    }

    // nothing to pass on
    if ( data === null ) return; //next()

    emitter.emit('message', data)
    if ( data ) {
      data.stderr = !! (data.stderr || this._isErr)
      data.stdin  = !! (data.stdin)
      data.stdout = !  (data.stderr || data.stdin)

      if ( data.stderr ) emitter.emit('stderr', data)
      else if ( data.stdin ) emitter.emit('stdin', data)
      else emitter.emit('stdout', data)
    }
  }

  return function callee(chunk, enc, next) {
    if ( chunk !== null ) {
      chunk = Buffer.isBuffer(chunk) ? chunk : Buffer(chunk, enc)
      this.buffer = Buffer.concat([this.buffer, chunk])
    }

    if ( emitter.protocol == 'native' ) { //console.log(this.buffer.slice(0, 4).toString())
      if ( ! this.readlength && this.buffer.length >= 4 ) {
        this.readlength = this.buffer.slice(0, 4).readInt32LE(0)
        this.buffer = this.buffer.slice(5)
      }
      if ( ! this.readlength || this.buffer.length < this.readlength )
        return next()

      processInput.call(this, this.buffer.slice(0, this.readlength).toString('utf8').trim())
      this.buffer = this.buffer.slice(this.readlength+1)
      this.readlength = null

      (callee || arguments.callee)(null, enc, next)
    }
    else {
      var newLineIndex = null

      while ( (newLineIndex = bufferIndexOf(this.buffer, Buffer('\n'))) !== -1 ) {//console.log('foo',chunk.toString('utf8'),'bar', newLineIndex) // \033[0G
        var line = this.buffer.slice(0, newLineIndex)
        this.buffer = this.buffer.slice(newLineIndex + 1)

        //see latter todo
        //if ( _stdin_ignore && line.equals(_stdin_ignore) ) { _stdin_ignore = null; return }

        //line = line.toString('utf8').trim()
        // skip empty lines
        //if ( line.length === 0 ) continue

        processInput.call(this, line)
      }
        console.log(this.buffer.length)
      next()
    }
  }
}

module.exports = exports = stream
