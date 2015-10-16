// subcomandante
var run = require('./index')
var res = run(['ls', '/']) // will exit with parent.

res.pipe(process.stdout)

setTimeout(function () {
  process.exit(0)
}, 200)
