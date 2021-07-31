module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const likeSchema = new Schema({
    user: { // 点赞用户
      type: mongoose.ObjectId, // 关联id类型
      ref: 'User', // id属于 User 模型
      required: true
    },
    like: { // 点赞状态
      type: Number,
      enum: [1, -1], // 枚举，喜欢 1，不喜欢 -1
      required: true
    },
    video: { // 点赞视频
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

  // 集合名称：VideoLike --> 在数据库中就是 videolikes
  return mongoose.model('VideoLike', likeSchema)
}