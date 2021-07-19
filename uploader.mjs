// const child_process = require('child_process')
import child_process from 'child_process'
import { shallowRef, reactive, effect, ref, computed } from '@vue/reactivity'
import { logger } from './logger.mjs'

const taskList = shallowRef([])

let currentUploader = null
const isFree = ref(true)

// const isAllDone = computed(() => {
//   // console.log('taskList.value.length', taskList.value.length)
//   return !taskList.value[0]
// })

// const newTask = computed(() => {
//   if (taskList.length < 1) return
//   return taskList[0]
// })

effect(() => {
  //  ? 为什么这里taskList的length还是1???? 不能用length判断了
  // console.log('effect taskList.length', taskList.length)

  // console.log('taskList[0]', taskList, taskList[0])
  // console.log('isFree.value', isFree.value)
  // console.log('isAllDone.value', isAllDone.value)
  // const newTask = taskList.value.shift()
  // console.log('newTask', newTask)
  if (isFree.value && taskList.value.shift()) {
    // console.log('taskList.value', taskList.value)
    console.log(
      '======================triggered================================='
    )

    logger.log('info', {
      // data: JSON.stringify({ taskList }),
      message: '开始上传',
    })
    // console.log('taskList', taskList)

    isFree.value = false
    // console.log('taskList.length', taskList.length, taskList[0])
    // taskList.shift()
    // console.log('taskList.length', taskList.length, taskList[0])

    currentUploader = child_process.spawn('py', ['-3', 'uploader.py'])

    currentUploader.stdout.on('data', function (uploaderMessage) {
      // console.log('stdout: ' + data)
      // console.log('uploaderMessage', uploaderMessage.toString('utf8'))
      // if (uploaderMessage.toString() !== '') {
      //   const data = JSON.stringify({ taskList: taskList.value }).replace(
      //     /"/g,
      //     '""'
      //   )
      //   logger.log('info', {
      //     data: `"${data}"`,
      //     message: uploaderMessage,
      //   })
      // }
    })

    currentUploader.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })

    currentUploader.on('close', function (code) {
      // console.log('子进程已退出，退出码 ' + code)

      logger.log('info', {
        // data: JSON.stringify({ taskList }),
        message: '上传程序结束',
      })
      isFree.value = true
    })
  }
})

export { taskList, isFree }
