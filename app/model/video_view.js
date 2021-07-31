// 观看历史
module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const viewSchema = new Schema({
    user: { // 用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true
    },
    video: { // 视频，例如 用户：张三，看了哪个视频
      type: mongoose.ObjectId, // 关联id类型
      ref: 'Video', // id属于 Video 模型
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

  // 集合名称：View --> 在数据库中就是 views
  return mongoose.model('View', viewSchema)
}