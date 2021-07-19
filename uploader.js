const taskList = []
const child_process = require('child_process')

for (var i = 0; i < 3; i++) {
  var workerProcess = child_process.spawn('python', ['uploader.py', i])

  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data)
  })

  workerProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
  })

  workerProcess.on('close', function (code) {
    console.log('子进程已退出，退出码 ' + code)
  })
}

module.exports = {
  taskList,
}
