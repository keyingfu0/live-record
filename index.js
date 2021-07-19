const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const koaBody = require('koa-body')

const app = new Koa()
const router = new Router()

app.use(logger())

// app.use(render);

app.use(koaBody())

router.post('/webhook', (ctx, next) => {
  console.log(ctx)
  ctx.body = 'Hello World2'
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(1219)
console.log('server is listening on port 1219')
