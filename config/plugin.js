'use strict';

/** @type Egg.EggPlugin */
// module.exports = {
//   // had enabled by egg
//   // static: {
//   //   enable: true,
//   // }
//   mongoose: {
//     enable: true,
//     package: 'egg-mongoose',
//   },
// };

// 配置 egg-mongoose 插件
exports.mongoose = {
  enable: true,
  package: 'egg-mongoose'
}

// 配置 egg-validate 插件，来进行数据验证
exports.validate = {
  enable: true,
  package: 'egg-validate'
}

// 配置 egg-cors 插件，来进行跨域处理
exports.cors = {
  enable: true,
  package: 'egg-cors'
}
