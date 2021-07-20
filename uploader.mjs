// noinspection JSNonASCIINames,NonAsciiCharacters

import child_process from 'child_process'
import {
  shallowRef,
  reactive,
  effect,
  ref,
  computed,
  stop,
} from '@vue/reactivity'
import { logger } from './logger.mjs'
import {groupBy, mapValues} from 'lodash-es'

const taskList = shallowRef([])

let currentUploader = null
const isFree = ref(true)

const watch = (getter, fn) => {
  const runner = effect(getter, {
    lazy: true,
    scheduler: fn,
  })

  // a callback function is returned to stop the effect
  return () => stop(runner)
}

export function getDataForCSV(data) {
  const str = JSON.stringify(data).replace(/"/g, '""')

  return `"${str}"`
}


//  webhook记录
const events = reactive([])

// 函数, 还是computed?
// 只有effect的computed才会被计算????
const 事件_按sessionId分组 = computed(() => {
  const res = groupBy(events, 'EventData.SessionId')
  // console.log('-> !!!!!!!!!!!!!res', res)
  return res
})

const 事件_按sessionId分组_按类型分组 = computed(() => {
  const res = mapValues(事件_按sessionId分组.value, (v) =>
    groupBy(v, 'EventType')
  )
  // console.log("-> 事件_按sessionId分组_按类型分组1", res);
  return res
})

const 文件列表_按sessionId分组 = computed(()=>{
  return mapValues(事件_按sessionId分组_按类型分组.value,v=>{
    return v.FileClosed.map(item=>item.EventData.RelativePath)
  })
})

/**
 * 为子程序记录日志
 *
 * @param chunk
 * @param level
 */
function logChunk(chunk,{level='info'}={}) {
  const uploaderMessage = chunk.toString()
  const uploaderMessageSplit = uploaderMessage.split(/\r\n/).slice(0, -1)

  for (const message of uploaderMessageSplit) {
    logger.log(level, {
      message: '来自uploader: ' + message,
    })
  }
}

effect(() => {
  //  ? 为什么这里taskList的length还是1???? 不能用length判断了

  // NOTE 这里用了短路的特性...先判断是否有空
  if (isFree.value && taskList.value[0]) {
    const sessionId_新任务 = taskList.value.shift()
    if(!sessionId_新任务) return

    const 当前文件列表 =  文件列表_按sessionId分组.value[sessionId_新任务]
    logger.log('info', {
      data: getDataForCSV({sessionId_新任务,当前文件列表}),
      message: '==================开始上传==================',
    })

    isFree.value = false

    currentUploader = child_process.spawn('py', ['-3', 'uploader.py',当前文件列表])
    currentUploader.stdout.on('data', logChunk)
    currentUploader.stderr.on('data', function (chunk) {
      logChunk(chunk,{level: 'error'})
    })
    currentUploader.on('close', function (code) {
      logger.log('info', {
        message: '==================上传程序结束==================',
      })
      isFree.value = true
    })
  }
})






export { taskList, isFree, events }
