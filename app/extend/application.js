/**
 * 扩展 Egg.js 应用实例 Application
 */
const RPCClient = require('@alicloud/pop-core').RPCClient

function initVodClient(accessKeyId, accessKeySecret) {
  const regionId = 'cn-beijing' // 点播服务接入区域
  const client = new RPCClient({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21'
  })
  return client
}

let vodClient = null

module.exports = {
  // getter
  // 懒汉式单例
  get vodClient() {
    if (!vodClient) {
      const { accessKeyId, accessKeySecret } = this.config.vod // 如果写成箭头函数，this指向就不对了
      vodClient = initVodClient(accessKeyId, accessKeySecret)
    }
    return vodClient
  }
}
