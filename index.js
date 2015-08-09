var comandante = require('comandante')

// spawn a child process that will only live
// as long as its parent. If the parent dies,
// so will the child. (this should work already,
// but it doesn't always work... hence this.)
module.exports = function (cmd, args, opts) {
  if (Array.isArray(cmd)) {
    opts = args;
    args = cmd.slice(1);
    cmd = cmd[0];
  }
  opts = opts || {}

  var w = opts.waitPid || process.pid
  delete opts.waitPid

  args = [w, cmd].concat(args)
  return comandante('./subcom', args, opts)
}
