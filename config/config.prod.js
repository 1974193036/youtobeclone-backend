/**
 * 生产环境的配置文件
 */
// exports.vod = {
//   accessKeyId: process.env.accessKeyId,
//   accessKeySecret: process.env.accessKeySecret
// }

const secret = require('./secret')
exports.vod = {
  ...secret.vod
}
