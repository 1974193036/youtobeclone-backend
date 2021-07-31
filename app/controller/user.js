'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  // 注册
  async create() {
    // 1. 数据校验
    const body = this.ctx.request.body
    // console.log(body)
    // { username: 'do magna', email: 's.kgpdrkdqzg@qyhmv.to', password: 'dolor fugiat laborum' }

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' }
    }, body)
    // this.userService = this.service.user
    if (await this.service.user.findByUsername(body.username)) {
      this.ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'username',
            message: '用户名已存在'
          }
        ]
      })
    }
    if (await this.service.user.findByEmail(body.email)) {
      this.ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'email',
            message: '邮箱已存在'
          }
        ]
      })
    }

    // 2. 保存用户到数据库
    const user = await this.service.user.createUser(body)

    // 3. 生成 token
    const token = this.service.user.createToken({
      userId: user._id
    })

    // 4. 发送响应
    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  // 登录
  async login() {
    // 1. 数据校验
    //  基本数据格式验证
    //  验证邮箱是否存在
    //  验证密码是否正确
    // 2. 生成token
    // 3. 发送响应

    const body = this.ctx.request.body
    // console.log(body)
    // { password: '123456', email: '1974193036@qq.com' }
    this.ctx.validate({
      email: { type: 'email' },
      password: { type: 'string' }
    }, body)

    const user = await this.service.user.findByEmail(body.email)
    // console.log(user)
    if (!user) {
      this.ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'email',
            message: '邮箱不存在'
          }
        ]
      })
    }
    if (this.ctx.helper.md5(body.password) !== user.password) {
      this.ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'password',
            message: '密码不正确'
          }
        ]
      })
    }

    const token = this.service.user.createToken({
      userId: user._id
    })

    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  // 获取当前登录人用户信息
  getCurrentUser() {
    // console.log(this.ctx.user)
    // { _id: 'xxxx', email: 'xxxx', username: 'xxxx', channelDescription: 'xxxx', avatar: 'xxxx', ... }

    // 1. 验证 token， 在 auth 中间件里
    // 2. 获取用户，在 auth 中间件里
    // 3. 发送响应
    const user = this.ctx.user
    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  // 更新用户信息
  async update() {
    // 1. 数据校验
    //  基本数据格式验证
    //  验证用户是否存在
    //  验证邮箱是否存在
    // 2. 更新用户信息
    // 3. 发送响应
    const body = this.ctx.request.body
    // console.log(body)
    // {
    //   email: '1974193036@qq.com'
    //   username: 'cccc',
    //   password: '123456',
    //   channelDescription: '哈哈',
    //   avatar: 'https://cn.vuejs.org/images/logo.svg',
    // }
    this.ctx.validate({
      email: { type: 'email', required: false },
      username: { type: 'string', required: false },
      password: { type: 'string', required: false },
      channelDescription: { type: 'string', required: false },
      avatar: { type: 'string', required: false }
    }, body)

    if (body.username) {
      if (body.username !== this.ctx.user.username && await this.service.user.findByUsername(body.username)) {
        this.ctx.throw(422, '用户名已存在')
      }
    }
    if (body.email) {
      if (body.email !== this.ctx.user.email && await this.service.user.findByEmail(body.email)) {
        this.ctx.throw(422, '邮箱已存在')
      }
    }
    if (body.password) {
      body.password = this.ctx.helper.md5(body.password)
    }

    const user = await this.service.user.updateUser(body)

    this.ctx.body = {
      user: {
        email: user.email,
        password: user.password,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  // 订阅频道（用户）
  async subscribe() {
    // console.log(this.ctx.params) // { userId: 'xxx' }
    const channelId = this.ctx.params.userId // 订阅的频道的_id（频道的_id其实就是其他用户的_id） 也叫被订阅用户的_id
    const userId = this.ctx.user._id // 当前登录人的_id
    // console.log(channelId.equals(userId))
    // 1. 用户不能订阅自己
    // console.log(typeof channelId) // string
    // console.log(typeof userId) // object
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能订阅自己')
    }
    // 2. 添加订阅
    const user = await this.service.user.subscribe(userId, channelId)
    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: true
      }
    }
  }

  // 取消订阅频道（用户）
  async unsubscribe() {
    const channelId = this.ctx.params.userId // 订阅的频道的_id（频道的_id其实就是其他用户的_id） 也叫被订阅用户的_id
    const userId = this.ctx.user._id // 当前登录人的_id
    // 1. 用户不能订阅自己
    if (userId.equals(channelId)) {
      this.ctx.throw(422, '用户不能取消订阅自己')
    }
    // 2. 取消订阅
    const user = await this.service.user.unsubscribe(userId, channelId)
    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: false
      }
    }
  }

  // 获取指定的用户（频道）信息
  async getUser() {
    const channelId = this.ctx.params.userId // 订阅的频道的_id（频道的_id其实就是其他用户的_id） 也叫被订阅用户的_id

    const { User, Subscription } = this.app.model
    // 1. 获取订阅状态
    let isSubscribed = false
    if (this.ctx.user) { // 如果用户已经登录
      const record = await Subscription.findOne({ // 看这个用户是否订阅过
        user: this.ctx.user._id, // 当前登录人
        channel: channelId
      })
      if (record) {
        isSubscribed = true
      }
    }
    // 2. 获取用户信息
    const user = await User.findById(channelId)
    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed
      }
    }
  }

  // 获取指定的用户的订阅列表（这个用户订阅了哪些其他人（频道））
  async getSubscriptions() {
    const { Subscription } = this.app.model
    let subscriptions = await Subscription.find({
      user: this.ctx.params.userId
    }).populate('channel') // 映射channel，把_id映射成具体的信息
    // console.log(subscriptions)
    subscriptions = subscriptions.map(item => {
      return this.ctx.helper._.pick(item.channel, [
        '_id',
        'username',
        'avatar'
      ])
      // return {
      //   _id: item.channel._id,
      //   username: item.channel.username,
      //   avatar: item.channel.avatar,
      // }
    })
    this.ctx.body = {
      subscriptions
    }
  }
}

module.exports = UserController

