'use strict';

const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    const { ctx } = this
    ctx.body = 'hi, egg222'
  }
}

module.exports = HomeController
