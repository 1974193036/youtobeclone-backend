module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const commentSchema = new Schema({
    content: { // 评论内容
      type: String,
      required: true
    },
    user: { // 评论用户
      type: mongoose.ObjectId, // 关联id类型
      ref: 'User', // id属于 User 模型
      required: true
    },
    video: { // 评论视频
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

  // 集合名称：Comment --> 在数据库中就是 comments
  return mongoose.model('Comment', commentSchema)
}