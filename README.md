# node-subcomandante

Morir fue lo unico que el subcomandante hizo sin su comandante.

This module is a companion to [comandante](https://github.com/substack/comandante). It is meant to solve the problem of child processes which must die along with their parents in node, which often leaves children hanging.

## Usage

`subcomandante` works just like `comandante`:

```js
// comandante
var run = require('comandante')
run(['tail', '-f', '/dev/null']) // will wait forever.
process.exit(0)

// subcomandante
var run = require('subcomandante')
run(['tail', '-f', '/dev/null']) // will exit with parent.
process.exit(0)
```

#### `opts.waitPid`

Pass in a `pid` with `opts.waitPid` to wait on that process, instead of the current process (`process.pid`).

```js
run(['nc', '-l', '1234'], {waitPid: 1919})
```

## `subcom` binary

```
> subcom
usage: subcom <pid> <cmd>...
run <cmd> until <pid> exits.
```

The `subcom` binary is very simple-- it runs a child process until process with given `<pid>` exits. It forwards all io, and exits with the same error code as the child. It will also employ brute strength (`kill -9`) if the child refuses to exit gracefully.
