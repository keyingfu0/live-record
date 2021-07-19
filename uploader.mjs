import child_process from 'child_process'
import { shallowRef, reactive, effect, ref, computed } from '@vue/reactivity'
import { logger } from './logger.mjs'

const taskList = shallowRef([])

let currentUploader = null
const isFree = ref(true)

effect(() => {
  //  ? 为什么这里taskList的length还是1???? 不能用length判断了
  if (isFree.value && taskList.value.shift()) {
    logger.log('info', {
      message: '==================开始上传==================',
    })

    isFree.value = false

    currentUploader = child_process.spawn('py', ['-3', 'uploader.py'])
    currentUploader.stdout.on('data', function (uploaderMessage) {})
    currentUploader.stderr.on('data', function (data) {
      console.log('stderr: ' + data)
    })
    currentUploader.on('close', function (code) {
      logger.log('info', {
        message: '上传程序结束',
      })
      isFree.value = true
    })
  }
})

export { taskList, isFree }
