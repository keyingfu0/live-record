// noinspection JSNonASCIINames

import Koa from 'koa'
import Router from 'koa-router'
import koaLogger from 'koa-logger'
import koaBody from 'koa-body'

import {taskList, isFree, getDataForCSV, set事件_按sessionId分组} from './uploader.mjs'
import { logger } from './logger.mjs'
import { debounce, last } from 'lodash-es'
import {DEBOUNCE_TIME} from "./server.config.mjs";

const app = new Koa()
const router = new Router()

app.use(koaLogger())
app.use(koaBody())

// const DEBOUNCE_TIME = 30*60*1000;


const sendToTask = debounce((event) => {
  // const lastEvent = last(events)
  logger.log('info', {
    // data: getDataForCSV(event),
    message: `"录制结束, 防抖时间到, 发送上传任务"`,
  })
  taskList.value = [...taskList.value, event.EventData.SessionId]
}, DEBOUNCE_TIME)

router.post('/webhook', (ctx, next) => {
  ctx.body = ''

  const { body } = ctx.request
  const { EventType, EventData } = body
  const { RelativePath,Title } = EventData

  set事件_按sessionId分组(body)
  if (EventType === 'SessionEnded') {
    sendToTask(body)
  }

  // console.log("-> EventData", EventData);
  // console.log("-> body", body);

  const data = getDataForCSV({ taskList: taskList.value, body })
  logger.log('info', {
    // data,
    message: `收到webhook: ${EventType} -> ${RelativePath?RelativePath:Title} `,
  })
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(1219,'127.0.0.1')
console.log('server is listening on port 1219')
