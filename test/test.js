#!/usr/bin/env node

var isrunning = require('is-running')
var test = require('tap').test
var run = require('../')
var exec = require('child_process').exec

var survivor = [__dirname + '/../survivor']
var hang = 'tail -f /dev/null'.split(' ')

function token() {
  return Math.random().toString().substr(2)
}

function psExpect(pid, expect, grace, cb) {
  setTimeout(function() {
    isrunning(pid, function(err, actual) {
      if (err) return cb(err)

      if (actual !== expect && grace > 0) {
        psExpect(pid, expect, grace--, cb)
        return
      }

      cb(null, actual)
    })
  }, 200)
}

function isRunningGrep(pattern, cb) {
  var cmd = 'ps aux'
  var p = exec(cmd, function(err, stdout, stderr) {
    if (err) return cb(err)

    var running = (stdout.match(pattern) !== null)
    cb(null, running)
  })
}

function checkDead(t, p, token) {
  p.on('error', function(err) {
    console.error(err)
  })

  p.on('exit', function() {
    t.ok(true, 'called exit')
    isRunningGrep(token, function(err, running) {
      t.ok(err === null, 'ps ok')
      t.ok(!running, 'process has died')
    })
  })
}

test('SIGTERM kills hang', function (t) {
  var tok = token()

  t.plan(7)
  var p = run(hang.concat([tok]))
  checkDead(t, p, tok) // 3

  psExpect(p.pid, true, 10, function(err, running) {
    t.ok(err === null, 'pse ok')
    t.ok(running, 'should be running')

    p.kill('SIGTERM') // should kill it
    psExpect(p.pid, false, 10, function(err, running) {
      t.ok(err === null, 'pse ok')
      t.ok(!running, 'should NOT be running after SIGTERM')
    })
  })
})

test('SIGKILL kills survivor', function (t) {
  t.plan(9)

  var tok = token()
  var p = run(survivor.concat([tok]))
  checkDead(t, p, tok) // 3

  psExpect(p.pid, true, 10, function(err, running) {
    t.ok(err === null, 'pse ok')
    t.ok(running, 'should be running')

    p.kill('SIGTERM') // should kill it
    psExpect(p.pid, true, 10, function(err, running) {
      t.ok(err === null, 'pse ok')
      t.ok(running, 'should be running after SIGTERM')

      p.kill('SIGKILL') // should kill it
      psExpect(p.pid, false, 15, function(err, running) {
        t.ok(err === null, 'pse ok')
        t.ok(!running, 'should NOT be running after SIGKILL')
      })
    })
  })

  p.pipe(process.stdout)
})
