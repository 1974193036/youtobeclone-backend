const Service = require('egg').Service
const jwt = require('jsonwebtoken')

class UserService extends Service {
  get User() { // 定于属性访问器，简化写法
    return this.app.model.User
  }
  findByUsername(username) {
    return this.User.findOne({
      username
    })
  }
  findByEmail(email) {
    return this.User.findOne({
      email
    }).select('+password') // 数据模型中定义了查询中不包含password字段，但是登录需要用到password校验，最后手动再加个password带出来
  }
  async createUser(data) {
    data.password = this.ctx.helper.md5(data.password)
    const user = new this.User(data)
    await user.save() // 保存到数据库中
    return user
  }
  createToken(data) {
    // 第一个参数：Payload（负载），用来存放实际需要存放的数据
    // 第二个参数：Signature（签名）所需的密钥 secret
    console.log('-----<>', this.config.jwt)
    console.log('-----<>', data)
    const token = jwt.sign(data, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresIn
    })
    return token
  }
  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret) // { userId: 'xc1232dqsda'  }
  }
  updateUser(data) {
    return this.User.findByIdAndUpdate(this.ctx.user._id, data, {
      new: true // 返回更新之后的数据
    })
  }
  async subscribe(userId, channelId) {
    const { User, Subscription } = this.app.model
    // 1. 检查是否已经订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId
    })
    const user = await User.findById(channelId)
    // 2. 没有订阅，添加订阅
    if (!record) {
      await new Subscription({
        user: userId,
        channel: channelId
      }).save()
      // 更新用户的被订阅数量
      user.subscribersCount++
      await user.save()
    }
    // 3. 返回被订阅人的信息
    return user
  }

  async unsubscribe(userId, channelId) {
    const { User, Subscription } = this.app.model
    // 1. 检查是否已经订阅，已经订阅过的才能取消订阅
    const record = await Subscription.findOne({
      user: userId,
      channel: channelId
    })
    const user = await User.findById(channelId)
    if (record) {
      // 2. 取消订阅
      await record.remove() // 删除订阅记录
      // 更新用户的被订阅数量
      user.subscribersCount--
      await user.save()
    }
    // 3. 返回被订阅人的信息
    return user
  }

  // async list(page = 1) {
  //   // console.log(this.config.robot)
  //   // read config
  //   const { serverUrl, pageSize } = this.config.news

  //   // use build-in http client to GET hacker-news api
  //   const { data: idList } = await this.ctx.curl(`${serverUrl}/topstories.json`, {
  //     data: {
  //       orderBy: '"$key"',
  //       startAt: `"${pageSize * (page - 1)}"`,
  //       endAt: `"${pageSize * page - 1}"`,
  //     },
  //     dataType: 'json',
  //   });

  //   // parallel GET detail
  //   const newsList = await Promise.all(
  //     Object.keys(idList).map(key => {
  //       const url = `${serverUrl}/item/${idList[key]}.json`
  //       return this.ctx.curl(url, { dataType: 'json' })
  //     })
  //   );
  //   return newsList.map(res => res.data)
  // }
}

module.exports = UserService