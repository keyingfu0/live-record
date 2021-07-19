// const Koa = require('koa')
// const Router = require('koa-router')
// const logger = require('koa-logger')
// const koaBody = require('koa-body')

import Koa from 'koa'
import Router from 'koa-router'
import koaLogger from 'koa-logger'
import koaBody from 'koa-body'

import { taskList, isFree } from './uploader.mjs'

import { logger } from './logger.mjs'

const app = new Koa()
const router = new Router()

app.use(koaLogger())

// app.use(render);

app.use(koaBody())

router.post('/webhook', (ctx, next) => {
  // console.log(ctx)
  // console.log('taskList.value', taskList.value)
  taskList.value = [...taskList.value, 1]
  // console.log('taskList.length', taskList.length)
  // if (taskList.length === 1) {
  //   isFree.value = true
  // }
  ctx.body = taskList.value

  const { body } = ctx.request
  // console.log('body', ctx.request.body)
  // logger.log('info', { status: '233' })
  const data = JSON.stringify({ taskList: taskList.value, body }).replace(
    /"/g,
    '""'
  )
  logger.log('info', {
    data: `"${data}"`,
    message: '收到webhook',
  })
  // logger.info({ status: 'sdsddsd' })
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(1219)
console.log('server is listening on port 1219')
