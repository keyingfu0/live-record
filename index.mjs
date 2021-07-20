// noinspection JSNonASCIINames

import Koa from 'koa'
import Router from 'koa-router'
import koaLogger from 'koa-logger'
import koaBody from 'koa-body'

import {taskList, isFree, getDataForCSV, set事件_按sessionId分组, getCSVStr} from './uploader.mjs'
import { logger } from './logger.mjs'
import { debounce, last } from 'lodash-es'
import {configs, DEBOUNCE_TIME, exportWhenProduction} from "./server.config.mjs";

const app = new Koa()
const router = new Router()

app.use(koaLogger())
app.use(koaBody())

// const DEBOUNCE_TIME = 30*60*1000;


const sendToTask = debounce((event) => {
  // const lastEvent = last(events)
    const {SessionId,Title} = event.EventData

  logger.log('info', {
    data: exportWhenProduction(getDataForCSV(event)),
    message: getCSVStr(`录制结束60秒后, 发送上传任务:`),
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
    data: exportWhenProduction(data),
    message: `收到webhook: ${EventType} -> ${RelativePath?RelativePath:Title} `,
  })
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(1219,configs.ip)
console.log('server is listening on port 1219')
