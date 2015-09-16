# c3io [![Build Status](https://travis-ci.org/fentas/c3io.svg)](https://travis-ci.org/fentas/c3io)

c3io exploits stdin and stdout for [inter-process communication](http://en.wikipedia.org/wiki/Inter-process_communication)
in order to communicate with other processes.

If you only want to communicate with parent to child in nodejs you simply can use
standard [child_process communication](https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle).

__WORK IN PROGRESS - NOT STABLE__

## Use cases

Have a look at [c3docker](https://github.com/fentas/c3docker) using c3io as means
of communicating with [docker](https://github.com/docker/docker) container.

## Basic usage

```nodejs
var c3io  = require('c3io')(options),
    spawn = require('child_process').spawn

c3io.on('message', function(msg) {
  // input request
  if ( msg.stdin ) {
    // send message [string]
    this.stdin = 'Hello World'
  }
  // stderr stream
  else if ( msg.stderr ) {
    console.log('stderr', msg.toString('utf8'))
  }
  // stdout stream
  else {
    console.log('stdout', msg.toString('utf8'))
  }
})

var child = spawn(
    'casperjs',
    ['test.js'],
    {stdio: c3io.stdio})
```

First a new c3io instance is created, which is basically an [EventEmitter](https://nodejs.org/api/events.html).
Then you can listen to `message` as you would with [child processes](https://nodejs.org/api/child_process.html).
Your child process can invoke this with simple commands. Here e.g. for [casperjs](http://casperjs.org/).

```js
var system = require('system'),
    casper = require("casper").create();

system.stdout.write('Hello, system.stdout.write!\n');

system.stdout.writeLine("c3io!req");
var line = system.stdin.readLine();
system.stdout.writeLine(line);

casper.echo('c3io!stp');
casper.exit();
```

__notice__ [ _default_ ] for c3io is each line a command to be passed on. For that make sure it
ends with an EOL. You can change this behavior with `options.protocol`.

As you maybe noticed there is also the ability to push for certain commands.
First there is the initial `c3io!` telling c3io to look for the given command.
You can change the initial sequence within the environment.

```sh
env c3ctr="foo" c3len=1 node example.js
```

`c3len` configures how long the command name is. [_default: 3_]
Currently there are following sequences. (for usage see latter example)

* c3io!__req__

> triggers an message event in order to replay to the input request

*c3io!__stp__ is [c3docker](https://github.com/fentas/c3docker) specific.*

#### options

* __protocol__ [ newline | native ] ~
_The same format is used to send messages in both directions._  
`newline`  
each line is a command to be passed on. For that make sure it ends with an EOL.  
`native`  
each message is serialized using Buffer and is preceded with 32-bit message length in native byte order.

#### custom commands

It is possible to define your own commands.

```node
var c3io = require('c3io')

c3io.r2d2.wrt = function(_data) {
  // create response
  var write = function() {
    c3io.r2d2.call(this, _data)
    // do stuff e.g. write data to filesystem
    require('fs').writeFile('example.txt', _data)
  }
  // inheriting from c3io.r2d2 makes sure that standard methods are given in the response
  // c3io.r2d2 inherits from Buffer
  util.inherits(write, c3io.r2d2)
  return new write;
}
```

And executing the command in child process.

```js
var system = require('system'),
    file_c = "Write something to File!"

// if you have line breaks within string make sure to handle them. e.g. through serializing.
system.stdout.writeLine("c3io!wrt" + file_c);
```

### Installation

```sh
npm install c3io --save
```

or directly from github

```sh
npm install fentas/c3io
```
