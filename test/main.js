var _c3io = require('../'),
    spawn = require('child_process').spawn,
		util = require('util');
require('should');
require('mocha');

describe('c3io', function() {

  var c3io
  process.chdir(__dirname)

  function todo(protocol) {
    it('stdout', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'stdout']),
          c3io = new _c3io({ protocol: protocol }).pipe(child)

      c3io.on('stdout', function(msg) {
        msg.toString('utf8').should.equal('test: stdout')
        done()
      })
    })
    it('stderr', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'stderr']),
          c3io = new _c3io({ protocol: protocol }).pipe(child)

      c3io.on('stderr', function(msg) {
        msg.toString('utf8').should.equal('test: stderr')
        done()
      })
    })
    it('stdin', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'stdin']),
          c3io = new _c3io({ protocol: protocol }).pipe(child)

      c3io
      .on('stdin', function(msg) {
        msg.toString('utf8').should.equal('test: stdin')
        this.stdin = 'stdin: test'
      })
      .on('stdout', function(msg) {
        msg.toString('utf8').should.equal('STDIN: TEST..')
        done()
      })
    })
    it('custom command', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'c3io!wrt']),
          c3io = new _c3io({ protocol: protocol }).pipe(child)

      c3io.r2d2.wrt = function(_data) {
        this.emit('write', _data.toString('utf8'))
      }

      c3io.on('write', function(msg) {
        msg.should.equal('test: c3io!wrt')
        done()
      })
    })
    it('pipe to stderr', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'c3io!wrt']),
          c3io = new _c3io({
            protocol: protocol,
            r2d2: {
              wrt: function(_data) {
                _data.toString('utf8').should.equal('test: c3io!wrt')
                _data.stderr = true
                return _data
              }
            }
          }).pipe(child)

      c3io.on('stderr', function(msg) {
        msg.toString('utf8').should.equal('test: c3io!wrt')
        done()
      })
    })
    it('communicating in base64 [c3po]', function(done) {
      var child = spawn('./child', ['--protocol', protocol, '--test', 'base64']),
          c3io = new _c3io({ protocol: protocol }).pipe(child),
          foo = false


      c3io.r2d2 = {
        c3po: function(_data) {
          (_data = _data.toString('utf8')).should.equal('dGVzdDogYmFzZTY0')
          return Buffer.concat([Buffer('c3io!foo'), Buffer(_data, 'base64')])
        },
        foo: function(msg) {
          foo = true
          msg = msg.toString('utf8')
          msg.should.equal('test: base64')
          return msg
        }
      }
      c3io.on('stdout', function(msg) {
        foo.should.equal(true)
        msg.should.equal('test: base64')
        done()
      })
    })
  }

  describe('protocol [newline]', function() { todo.call(this, 'newline') })
  //describe('protocol [native ]', function() { todo.call(this, 'native') })
})
