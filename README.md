# c3io

c3io exploits stdin and stdout for [inter-process communication](http://en.wikipedia.org/wiki/Inter-process_communication).
For that each communication will be passed through and processed accordingly.
Or you could use it as means of communication of Streams..?

If you only want to communicate with parent to child in nodejs you simply can use
standard [child_process communication](https://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle).

__WORK IN PROGRESS - NOT STABLE__

## Use cases

Have a look at [c3docker](https://github.com/fentas/c3docker) using it as means
of communicating with [docker](https://github.com/docker/docker) container.

## Basic usage

```node
var c3io  = require('c3io')(),
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
    {stdio: c3io})
```

First a new c3io instance is created, which is basically an [EventEmitter](https://nodejs.org/api/events.html).
Then you can listen to `message` as you would with [child processes](https://nodejs.org/api/child_process.html).
Your child process can invoke this with simple commands. Here e.g. for [casperjs](http://casperjs.org/).

```js
var system = require('system'),
    casper = require("casper").create();

system.stdout.write('Hello, system.stdout.write!\n');

system.stderr.writeLine("c3io!req");
var line = system.stdin.readLine();
system.stdout.writeLine(line);

casper.echo('c3io!stp');
casper.exit();
```

__notice__ for c3io is each line a command to be pass on. For that make sure it
ends with an EOL.

As you maybe noticed there is also the abillity to push for certain commands.
First there is the initial `c3io!` telling c3io to look for the given command.
You can change the initial sequence within the enviroment.

```sh
env c3ctr="foo" c3len=1 node example.js
```

c3len configures how long the command name is. [default: 3]
Default there are following sequences. (for usage see latter example)

* c3io!__req__
> triggers an message event in order to replay to the input request

c3io!__stp__ is [c3docker](https://github.com/fentas/c3docker) specific.

#### custom commands

It's possible to define your own commands.

```node

```

### Installation

```sh
npm install c3io --save
```

or directly from github

```sh
npm install fentas/c3io
```
