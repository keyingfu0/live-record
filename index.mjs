import Koa from 'koa'
import Router from 'koa-router'
import koaLogger from 'koa-logger'
import koaBody from 'koa-body'

import { taskList, isFree } from './uploader.mjs'

import { logger } from './logger.mjs'

const app = new Koa()
const router = new Router()

app.use(koaLogger())

app.use(koaBody())

router.post('/webhook', (ctx, next) => {
  taskList.value = [...taskList.value, 1]

  ctx.body = taskList.value

  const { body } = ctx.request

  const data = JSON.stringify({ taskList: taskList.value, body }).replace(
    /"/g,
    '""'
  )
  logger.log('info', {
    data: `"${data}"`,
    message: '收到webhook',
  })
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(1219)
console.log('server is listening on port 1219')
