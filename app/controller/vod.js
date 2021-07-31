'use strict';

const Controller = require('egg').Controller

class VodController extends Controller {
  // 获取视频上传地址和凭证
  async createUploadVideo() {
    const query = this.ctx.query
    console.log(query) // { Title: '某某视频', FileName: 'test.mp4' }

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate(
      {
        Title: { type: 'string' },
        FileName: { type: 'string' }
      },
      query
    )

    // var client = initVodClient('LTAI5tAaveWQ2JVhBigZNaNa', 'jITtIHd1C7xZfoLSdsaJrJNQolyaYl')
    // this.ctx.body = await client.request('RefreshUploadVideo', query, {})
    this.ctx.body = await this.app.vodClient.request('CreateUploadVideo', query, {})
    // 返回值
    // {
    //   "VideoId": "fbdb506aa0af4541bda4944d6abe115b",
    //   "UploadAddress": "eyJFbmRwb2ludCI6Imh0dHBzOi8vb3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tIiwiQnVja2V0Ijoib3V0aW4tNGVhNTA5NWNmMDNhMTFlYjhiZTYwMDE2M2UxMDhhOGYiLCJGaWxlTmFtZSI6InN2LzUxMzA3MTQwLTE3YWYxODk0NjQxLzUxMzA3MTQwLTE3YWYxODk0NjQxLm1wNCJ9",
    //   "RequestId": "1568ABC3-0A29-4EFB-88FB-84B2F01091CA",
    //   "UploadAuth": "xxxxx"
    // }
  }

  // 刷新视频上传地址和凭证
  async refreshUploadVideo() {
    const query = this.ctx.query
    console.log(query) // { VideoId: 'xxxx' }

    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate(
      {
        VideoId: { type: 'string' }
      },
      query
    )

    // var client = initVodClient('LTAI5tAaveWQ2JVhBigZNaNa', 'jITtIHd1C7xZfoLSdsaJrJNQolyaYl')
    // this.ctx.body = await client.request('RefreshUploadVideo', query, {})
    this.ctx.body = await this.app.vodClient.request('RefreshUploadVideo', query, {})
    // 返回值
    // {
    //   "VideoId": "fbdb506aa0af4541bda4944d6abe115b",
    //   "UploadAddress": "eyJFbmRwb2ludCI6Imh0dHBzOi8vb3NzLWNuLWJlaWppbmcuYWxpeXVuY3MuY29tIiwiQnVja2V0Ijoib3V0aW4tNGVhNTA5NWNmMDNhMTFlYjhiZTYwMDE2M2UxMDhhOGYiLCJGaWxlTmFtZSI6InN2LzUxMzA3MTQwLTE3YWYxODk0NjQxLzUxMzA3MTQwLTE3YWYxODk0NjQxLm1wNCJ9",
    //   "RequestId": "1568ABC3-0A29-4EFB-88FB-84B2F01091CA",
    //   "UploadAuth": "xxxxx"
    // }
  }

  // 获取视频播放凭证
  async getVideoPlayAuth() {
    const query = this.ctx.query
    console.log(query) // { VideoId: 'xxxx' }
    
    // 需要配置 egg-validate 插件，来进行数据验证
    // 如果验证失败，返回422状态码，经过统一错误处理中间件，就不会往下走了
    this.ctx.validate(
      {
        VideoId: { type: 'string' }
      },
      query
    )

    this.ctx.body = await this.app.vodClient.request('GetVideoPlayAuth', query, {})
  }
}

module.exports = VodController
