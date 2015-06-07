# c3io

c3io exploits stdin and stdout for [inter-process communication](http://en.wikipedia.org/wiki/Inter-process_communication).
For that each communication will be passed through and processed accordingly.

## Basic usage

There are several ways to use c3io.
Have a look bellow.

### Simple spawn

...

### Manage your instances

```node
var c3po = require('c3po-casperjs')

// ... spawn some instances

// all running instances as array
var inst = c3po.instances

// kill them slowly
inst[0].kill()

// kill them specificly
inst['google_scraper'].kill()

// or just kill them all
inst.kill()
```

## Events

_c3po events_
- message
> translated message

_nodejs child process events_
Please refer for that [Node.js v0.12.4 Manual & Documentation](https://nodejs.org/api/child_process.html)
