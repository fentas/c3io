var util = require('util'),
    Writable = require('stream').Writable,
    Readable = require('stream').Readable,
//    {Writable, Readable} = require('stream'),
    dataType = require('./data')


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
      console.warn(arguments)
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

    var _stdout = this._stdout, _this = this
    this._stdout._write = function(chunk, enc, next) {
      if ( ! chunk ) return _stdout.data = null
      chunk = chunk.toString('utf8')
      console.log(chunk)
next()
return
      if ( typeof _stdout.data == 'string' ) {
        chunk = _stdout.data + chunk
        _stdout.data = null
      }

      var check = function (c) {
        if ( dataType[c.slice(0, dataType.length)] ) {
          if ( _stdout.data !== null ) throw new Error('transfer corruption')
          return _stdout.data = new dataType[chunk.slice(0, dataType.length)]
        }
        return c
      }
      check(chunk)

      for ( var offset = 0 ; offset < chunk.length ; offset++ ) {
        // 0x0a -- linebreak
        if (chunk[offset] === 0x0a) {
            _stdout.data.push(chunk.slice(0, offset))
            _this.emitter.emit('message', _stdout.data)
            _stdout.data = check(chunk.slice(offset + 1))
            return
        }
      }
      _stdout.data.push(chunk)
      next()
    }
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

    var _stderr = this._stderr, _this = this
    //this._stderr.on('data', function(chunk) {
    //  if ( ! chunk ) {
    //    _this.emitter.emit('error', new Error(_stderr.data))
    //    return _stderr.data = null
    //  }
    //  _stderr.data += chunk
    //})

    return this._stderr
  }, writeable: false
})

module.exports = exports = stream
