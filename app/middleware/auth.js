// 登录权限中间件，放在路由里

module.exports = (options = { required: true }) => { // 外层函数负责接收额外参数
  // 返回一个中间件处理函数
  return async (ctx, next) => {
    // 1. 获取请求头中的 token 数据
    let token = ctx.headers.authorization 
    
    // console.log(this.ctx.headers.authorization === this.ctx.header.authorization) // true
    // console.log(token)
    // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MTAwMjkyOGY4YzI3ZjE3ODhlZTJiNTQiLCJpYXQiOjE2Mjc0Mzg1ODYsImV4cCI6MTYyNzUyNDk4Nn0.5yZzXMkefbpzkXAoNl4Fphur0hOfNKw0GZaMMyjUjbA
    
    token = token
      ? token.split('Bearer ')[1] // Bearer空格token数据
      : null

    if (token) {
      try {
        // 3. token 有效，根据 userId 获取用户数据挂载到 ctx 对象中给后续中间件使用
        const data = ctx.service.user.verifyToken(token) // { userId: 'xc1232dqsda'  }
        ctx.user = await ctx.model.User.findById(data.userId)
      } catch (err) {
        ctx.throw(401)
      }
    } else if (options.required) {
      ctx.throw(401)
    }

    // 4. next 执行后续中间件
    await next()
  }
}
