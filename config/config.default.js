/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1627390468662_2975';

  // add your middleware config here
  config.middleware = [
    'errorHandler' // 文件名如果是下划线，使用驼峰
  ]

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/youtobe-clone',
      options: {
        useUnifiedTopology: true,
      },
      // mongoose global plugins, expected a function or an array of function and options
      plugins: []
    }
  }

  // 框架的安全插件是默认开启的，如果我们想关闭其中一些安全防范，直接设置该项的 enable 属性为 false 即可
  // 关闭 csrf 安全校验
  config.security = {
    csrf: {
      enable: false
    }
  }

  config.jwt = {
    secret: 'ebc23898-768c-4f16-bd69-228e93997bec',
    expiresIn: '1d' // jwt有效期1天
  }

  config.cors = {
    origin: '*' // 允许跨域的网站地址
    // {string|Function} origin: '*',
    // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  }

  return {
    ...config,
    ...userConfig
  }
}
