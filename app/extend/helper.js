// 工具函数
const _ = require('lodash')
const crypto = require('crypto')

exports.hello = () => 'hello egg'

exports.md5 = str => {
  return crypto.createHash('md5').update(str).digest('hex')
}

exports._ = _