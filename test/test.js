var c3po = require('../')

var container = c3po.docker()

setTimeout(function() {
  container.kill(function() { console.log('killed'); })
}, 2000)
