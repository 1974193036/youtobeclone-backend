// 订阅频道
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const subscriptionSchema = new Schema({
    user: { // 订阅用户
      type: mongoose.ObjectId, // 关联id类型
      ref: 'User', // id属于 User 模型
      required: true
    },
    channel: { // 订阅频道（其实用户就是一个频道，例如：订阅用户：张三，订阅了李四的频道） 也叫被订阅用户
      type: mongoose.ObjectId, // 关联id类型
      ref: 'User', // id属于 User 模型
      required: true
    },
    createdAt: { // 创建时间
      type: Date,
      default: Date.now
    },
    updatedAt: { // 更新时间
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  })

  // 集合名称：Subscription --> 在数据库中就是 subscriptions
  return mongoose.model('Subscription', subscriptionSchema)
}