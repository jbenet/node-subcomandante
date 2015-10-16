var fork = require('child_process').fork
var duplexer = require('duplexer')

module.exports = function (file, args, opts) {
  if (Array.isArray(file)) {
    opts = args
    args = file.slice(1)
    file = file[0]
  }

  opts.silent = true

  var ps = fork(file, args, opts)
  var err = ''
  if (ps.stderr) {
    ps.stderr.on('data', function (buf) { err += buf })
  }

  ps.on('close', function (code) {
    if (code === 0) return
    dup.emit('error', new Error(
      'non-zero exit code ' + code
        + (!opts || opts.showCommand !== false
           ? '\n  while running: ' + file + ' ' + args.join(' ')
           : ''
          )
        + '\n\n  ' + err))
  })

  var dup = duplexer(ps.stdin, ps.stdout)

  dup.stdin = ps.stdin
  dup.stderr = ps.stderr
  dup.stdout = ps.stdout
  dup.pid = ps.pid
  dup.kill = ps.kill.bind(ps)

  var exitEvents = ['exit', 'close']

  exitEvents.forEach(function (name) {
    ps.on(name, dup.emit.bind(dup, name))
  })

  return dup
}
