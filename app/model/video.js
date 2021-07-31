module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const videoSchema = new Schema({
    title: { // 视频标题
      type: String,
      required: true
    },
    description: { // 视频介绍
      type: String,
      required: true
    },
    vodVideoId: { // VOD 视频 ID
      type: String,
      required: true
    },
    cover: { // 视频封面
      type: String,
      required: true
    },
    user: {
      type: mongoose.ObjectId, // 视频作者，// 关联id类型
      ref: 'User', // id属于 User 模型
      required: true
    },
    commentsCount: { // 评论数量
      type: Number,
      default: 0
    },
    dislikesCount: { // 不喜欢数量
      type: Number,
      default: 0
    },
    likesCount: { // 喜欢数量
      type: Number,
      default: 0
    },
    viewsCount: { // 观看次数
      type: Number,
      default: 0
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

  // 集合名称：Video --> 在数据库中就是 videos
  return mongoose.model('Video', videoSchema)
}