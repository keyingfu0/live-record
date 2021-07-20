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
import { groupBy, mapValues } from 'lodash-es'
import {configs, exportWhenProduction} from "./server.config.mjs";


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

export function getCSVStr(str) {
  const csvStr = str.replace(/"/g, '""')

  return `"${csvStr}"`
}

export function getDataForCSV(data) {
  // const str = JSON.stringify(data).replace(/"/g, '""')

  return getCSVStr(JSON.stringify(data))
}

//  webhook记录, 按sessionID分组
const 事件_按sessionId分组 = reactive({})
export const set事件_按sessionId分组 = (event) => {
  const { SessionId } = event.EventData

  if (!事件_按sessionId分组[SessionId]) {
    事件_按sessionId分组[SessionId] = [event]
  } else {
    事件_按sessionId分组[SessionId].push(event)
  }
}

// 函数, 还是computed?
// 只有effect的computed才会被计算????
// const 事件_按sessionId分组 = computed(() => {
//   const res = groupBy(events, 'EventData.SessionId')
//   // console.log('-> !!!!!!!!!!!!!res', res)
//   return res
// })

const 事件_按sessionId分组_按类型分组 = computed(() => {
  const res = mapValues(事件_按sessionId分组, (v) => groupBy(v, 'EventType'))
  // console.log("-> 事件_按sessionId分组_按类型分组1", res);
  return res
})

const 文件列表_按sessionId分组 = computed(() => {
  return mapValues(事件_按sessionId分组_按类型分组.value, (v) => {
    return v.FileClosed.map((item) => item.EventData.RelativePath)
  })
})

/**
 * 为子程序记录日志
 *
 * @param chunk
 * @param level
 */
function logChunk(chunk, { level = 'info' } = {}) {
  const uploaderMessage = chunk.toString()
  const uploaderMessageSplit = uploaderMessage.split(/\r\n/).slice(0, -1)

  for (const message of uploaderMessageSplit) {
    logger.log(level, {
      message: getCSVStr('来自uploader: ' + message),
    })
  }
}

effect(() => {
  //  ? 为什么这里taskList的length还是1???? 不能用length判断了

  // NOTE 这里用了短路的特性...先判断是否有空
  if (isFree.value && taskList.value[0]) {
    logger.log('info', {
      data: exportWhenProduction(getDataForCSV(taskList.value)),
      message: getCSVStr(`准备上传, 还有${taskList.value.length}项任务`),
    })

    const sessionId_新任务 = taskList.value.shift()
    if (!sessionId_新任务) return

    const 当前文件列表 = 文件列表_按sessionId分组.value[sessionId_新任务]
    const  所有事件 = 事件_按sessionId分组[sessionId_新任务]

    const {RelativePath,Title} = 所有事件[0].EventData
    const logData = getDataForCSV({ sessionId_新任务, 当前文件列表,所有事件 })
    logger.log('info', {
      data: exportWhenProduction(logData),
      message: `==================开始上传: ${Title}==================`,
    })
    logger.log('info', {
      message: getCSVStr(`当前文件列表: ${当前文件列表}`),
    })


    isFree.value = false

    currentUploader = child_process.spawn(...configs.getUploaderArgs(当前文件列表))
    currentUploader.stdout.on('data', logChunk)
    currentUploader.stderr.on('data', function (chunk) {
      logChunk(chunk, { level: 'error' })
    })
    currentUploader.on('close', function (code) {
      logger.log('info', {
        message: `==================上传程序结束: ${Title}==================`,
      })
      delete 事件_按sessionId分组[sessionId_新任务]

      logger.log('info', {
        data: exportWhenProduction(getDataForCSV(taskList.value)),
        message: getCSVStr(`上传完毕, 还有${taskList.value.length}项任务`),
      })

      // NOTE 稍等一会再开始下一个
      setTimeout(()=>{
      isFree.value = true
      },5000)

    })
  }
})

export { taskList, isFree }
