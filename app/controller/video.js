'use strict';

const Controller = require('egg').Controller

class VideoController extends Controller {
  // 创建视频
  async createVideo() {
    const body = this.ctx.request.body
    // console.log(body)
    // { title: 'non in', description: 'reprehenderit ea amet', vodVideoId: '0b331bed6230437382d4448fca9d9cae', cover: '' }
    const { Video } = this.app.model

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate({
      title: { type: 'string' },
      description: { type: 'string' },
      vodVideoId: { type: 'string' },
      cover: { type: 'string', required: false }
    }, body)

    body.cover = 'http://vod.lipengzhou.com/image/default/A806D6D6B0FD4D118F1C824748826104-6-2.png'
    body.user = this.ctx.user._id // 视频作者，即当前登录人_id
    const video = await new Video(body).save()
    this.ctx.status = 201
    this.ctx.body = {
      video
    }

    const setVideoCover = async (video) => {
      // 获取视频信息
      const vodVideoInfo = await this.app.vodClient.request('GetVideoInfo', {
        VideoId: video.vodVideoId
      })

      if (vodVideoInfo.Video.CoverURL) {
        // 使用自动生成的封面
        video.cover = vodVideoInfo.Video.CoverURL
        // 将修改保存到数据库中
        await video.save()
      } else {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 3000)
        })
        await setVideoCover(video)
      }
    }

    setVideoCover(video)
  }

  // 获取视频详情
  async getVideo() {
    // console.log(this.ctx.params.videoId) // 6102ac71fcc4dd49ed5d3085
    const { Video, VideoLike, Subscription } = this.app.model
    const { videoId } = this.ctx.params
    let video = await Video.findById(videoId).populate('user', '_id email username avatar subscribersCount')

    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    video = video.toJSON()
    // console.log(video)

    video.isLiked = false // 是否喜欢
    video.isDisliked = false // 是否不喜欢
    video.user.isSubscribed = false // 当前登录用户是否已订阅视频作者

    if (this.ctx.user) {
      const userId = this.ctx.user._id
      if (await VideoLike.findOne({ user: userId, video: videoId, like: 1 })) {
        video.isLiked = true
      }
      if (await VideoLike.findOne({ user: userId, video: videoId, like: -1 })) {
        video.isDisliked = true
      }
      if (await Subscription.findOne({ user: userId, channel: video.user._id })) {
        video.user.isSubscribed = true
      }
    }

    this.ctx.body = {
      video
    }
  }

  // 获取首页视频列表
  async getVideos() {
    const { Video } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)
    const getVideos = Video
      .find()
      .populate('user') // 映射出视频作者
      .sort({
        createdAt: -1 // 按照创建时间倒序排列，创建时间晚的在前面  // -1 倒叙，1 升序
      })
      .skip((pageNum - 1) * pageSize) // 跳过几条数据
      .limit(pageSize) // 取几条数据
    const getVideosCount = Video.countDocuments()
    // 并行执行
    const [videos, videosCount] = await Promise.all([
      getVideos,
      getVideosCount
    ])
    this.ctx.body = {
      videos,
      videosCount
    }
  }

  // 获取用户发布的视频列表
  async getUserVideos() {
    const { Video } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    const userId = this.ctx.params.userId
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)
    const getVideos = Video
      .find({
        user: userId
      })
      .populate('user') // 映射出视频作者
      .sort({
        createdAt: -1 // 按照创建时间倒序排列，创建时间晚的在前面  // -1 倒叙，1 升序
      })
      .skip((pageNum - 1) * pageSize) // 跳过几条数据
      .limit(pageSize) // 取几条数据
    const getVideosCount = Video.countDocuments({
      user: userId
    })
    const [videos, videosCount] = await Promise.all([
      getVideos,
      getVideosCount
    ])
    this.ctx.body = {
      videos,
      videosCount
    }
  }

  // 获取用户关注的频道视频列表(获取你关注的所有用户下的所有视频)
  async getUserFeedVideos() {
    const { Video, Subscription } = this.app.model
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)

    const userId = this.ctx.user._id

    const channels = await Subscription.find({ user: userId }).populate('channel') // 获取你订阅的所有用户列表
    console.log(channels) // 映射出被订阅的用户信息

    const getVideos = Video
      .find({
        user: { // 筛选出视频作者的_id只要是下面任意两个中的一个
          $in: channels.map(item => item.channel._id) // ['6100a9999192202713b53d73', '6100252799cb9c11b6a53873']
        }
      })
      .populate('user') // 映射出视频作者
      .sort({
        createdAt: -1
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
    const getVideosCount = Video.countDocuments({
      user: {
        $in: channels.map(item => item.channel._id)
      }
    })
    const [videos, videosCount] = await Promise.all([
      getVideos,
      getVideosCount
    ])
    this.ctx.body = {
      videos,
      videosCount
    }
  }

  // 修改视频
  async updateVideo() {
    const { Video } = this.app.model
    const body = this.ctx.request.body
    // console.log(body) // { title: '视频11', description: '视频11', ... }

    const videoId = this.ctx.params.videoId
    // console.log(videoId) // 6102ac71fcc4dd49ed5d3085
    const userId = this.ctx.user._id
    // console.log(userId) // 61002928f8c27f1788ee2b54

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
      vodVideoId: { type: 'string', required: false },
      cover: { type: 'string', required: false }
    }, body)

    const video = await Video.findById(videoId)
    // console.log(video.user) // 视频作者_id 61002928f8c27f1788ee2b54

    if (!video) {
      this.ctx.throw(404, '该视频不存在')
    }

    if (!userId.equals(video.user)) {
      this.ctx.throw(403, '只能修改你自己创建的视频')
    }

    // if (body.title) {
    //   video.title = body.title
    // }
    // if (body.description) {
    //   video.description = body.description
    // }
    Object.assign(video, this.ctx.helper._.pick(body, ['title', 'description', 'vodVideoId', 'cover']))

    // 把修改保存到数据库中
    await video.save()

    // 发送响应
    this.ctx.body = {
      video
    }
  }

  // 删除视频
  async deleteVideo() {
    const { Video } = this.app.model
    const videoId = this.ctx.params.videoId
    // console.log(videoId) // 610352bcd1b19d73c95796a6
    const userId = this.ctx.user._id
    // console.log(userId) // 61002928f8c27f1788ee2b54
    const video = await Video.findById(videoId)
    // console.log(video.user) // 视频作者_id 61002928f8c27f1788ee2b54

    if (!video) {
      this.ctx.throw(404, '该视频已经不存在')
    }

    if (!userId.equals(video.user)) {
      this.ctx.throw(422, '只能删除你自己创建的视频')
    }

    await video.remove()

    // await this.app.vodClient.request('DeleteVideo', {
    //   VideoIds: video.vodVideoId
    // })

    this.ctx.status = 204
  }

  // 添加视频评论
  async createComment() {
    const body = this.ctx.request.body // 评论内容
    const { videoId } = this.ctx.params // 评论的视频_id
    // console.log(body) // { content: '这个电影很好看' }
    // console.log(videoId) // 6102ac71fcc4dd49ed5d3085

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate({
      content: { type: 'string' }
    }, body)

    const { VideoComment, Video } = this.app.model

    const video = await Video.findById(videoId)
    if (!video) {
      this.ctx.throw(404, '该视频已经不存在')
    }
    const comment = await new VideoComment({
      content: body.content, // 评论内容
      user: this.ctx.user._id, // 评论用户，即当前登录人
      video: this.ctx.params.videoId // 评论视频_id
    }).save()
    // 更新视频的评论数量
    video.commentsCount = await VideoComment.countDocuments({
      video: videoId
    })
    await video.save()

    // 映射评论所属用户和视频字段数据
    await comment.populate('user').populate('video').execPopulate()

    this.ctx.body = {
      comment
    }
  }

  // 获取视频评论列表
  async getVideoComments() {
    const { videoId } = this.ctx.params // 视频_id
    // console.log(videoId) // 6102ac71fcc4dd49ed5d3085
    
    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)

    const { VideoComment } = this.app.model
    const getComments = VideoComment.find({
      video: videoId
    }) 
    .sort({
      createdAt: -1 // 按照创建时间倒序排列，创建时间晚的在前面  // -1 倒叙，1 升序
    })
    .skip((pageNum - 1) * pageSize) // 跳过几条数据
    .limit(pageSize) // 取几条数据
    .populate('user')
    .populate('video')

    const getCommentsCount = VideoComment.countDocuments({
      video: videoId
    })

    // 并行执行
    const [comments, commentsCount] = await Promise.all([
      getComments,
      getCommentsCount
    ])
    this.ctx.body = {
      comments,
      commentsCount
    }
  }

  // 删除视频评论
  async deleteVideoComment() {
    const { Video, VideoComment } = this.app.model
    const { videoId, commentId } = this.ctx.params

    // 校验视频是否存在
    const video = await Video.findById(videoId)
    if (!video) {
      this.ctx.throw(404, 'Video Not Found')
    }

    const comment = await VideoComment.findById(commentId)

    // 校验评论是否存在
    if (!comment) {
      this.ctx.throw(404, 'Comment Not Found')
    }

    // 校验评论作者是否是当前登录用户
    if (!comment.user.equals(this.ctx.user._id)) {
      this.ctx.throw(403)
    }

    // 删除视频评论
    await comment.remove()

    // 更新视频评论数量
    video.commentsCount = await VideoComment.countDocuments({
      video: videoId
    })
    await video.save()

    this.ctx.status = 204
  }

  // 喜欢视频
  async likeVideo() {
    const { Video, VideoLike } = this.app.model
    const { videoId } = this.ctx.params // 点击的喜欢的视频_id  6102ac71fcc4dd49ed5d3085
    const userId = this.ctx.user._id // 当前登录人_id
    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, '该视频不存在')
    }

    // 对于登录用户来说
    const doc = await VideoLike.findOne({
      user: userId,
      video: videoId
    })

    let isLiked = true

    if (doc && doc.like === 1) {
      await doc.remove() // 取消点赞
      isLiked = false
    } else if (doc && doc.like === -1) {
      doc.like = 1
      await doc.save()
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: 1
      }).save()
    }

    // 更新喜欢视频的数量
    video.likesCount = await VideoLike.countDocuments({
      video: videoId,
      like: 1
    })

    // 更新不喜欢视频的数量
    video.dislikesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    })

    // 将修改保存到数据库中
    await video.save()

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isLiked
      }
    }
  }

  // 不喜欢视频
  async dislikeVideo () {
    const { Video, VideoLike } = this.app.model
    const { videoId } = this.ctx.params
    const userId = this.ctx.user._id
    const video = await Video.findById(videoId)

    if (!video) {
      this.ctx.throw(404, `No video found for ID - ${videoId}`)
    }

    const doc = await VideoLike.findOne({
      user: userId,
      video: videoId
    })

    let isDisliked = true

    if (doc && doc.like === -1) {
      await doc.remove()
      isDisliked = false
    } else if (doc && doc.like === 1) {
      doc.like = -1
      await doc.save()
    } else {
      await new VideoLike({
        user: userId,
        video: videoId,
        like: -1
      }).save()
    }

    // 更新视频喜欢和不喜欢的数量
    video.likesCount = await VideoLike.countDocuments({
      video: videoId,
      like: 1
    })
    video.dislikesCount = await VideoLike.countDocuments({
      video: videoId,
      like: -1
    })

    this.ctx.body = {
      video: {
        ...video.toJSON(),
        isDisliked
      }
    }
  }

  // 获取用户喜欢的视频列表
  async getUserLikedVideos() {
    const { Video, VideoLike } = this.app.model

    let { pageNum = 1, pageSize = 10 } = this.ctx.query
    pageNum = Number.parseInt(pageNum)
    pageSize = Number.parseInt(pageSize)

    const likes = await VideoLike.find({
      user: this.ctx.user._id,
      like: 1
    })
    .sort({
      createdAt: -1
    })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)

    const getVideos = Video.find({ // 筛选出视频的_id只要是下面任意几个中的一个
      _id: {
        $in: likes.map(item => item.video) // 拿到喜欢的视频的_id列表
      }
    }).populate('user')

    const getVideosCount = VideoLike.countDocuments({
      user: this.ctx.user._id,
      like: 1
    })
    const [videos, videosCount] = await Promise.all([
      getVideos,
      getVideosCount
    ])
    this.ctx.body = {
      videos,
      videosCount
    }
  }
}

module.exports = VideoController
