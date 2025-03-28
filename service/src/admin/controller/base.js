
'use strict';
//定义用户数据变量
let user = {};
module.exports = class extends think.Controller {

  /**
   *@description action请求验证用户token
   */
  async __before() {   
    if(this.ctx.method!='POST'){
      return this.fail(9993);
    }
    if (this.ctx.action === 'login' || this.ctx.action === 'register') {
      return;
    }

    //登录、注册不验证token
    if (this.ctx.action === 'login' || this.ctx.action === 'register') {
      return;
    }
    //获取http-header token
    let userToken = this.header("x-token");
    if(think.isEmpty(userToken)){
      return this.fail(9998);
    }  	
    //调用tokenservice中间件
    let tokenServiceInstance = this.service("token","admin");
    //验证token
    let verifyTokenResult = await tokenServiceInstance.verifyToken(userToken);
    //服务器错误时
    if (!verifyTokenResult) {
      return this.fail(9997);
    }
    //获取用户信息
    user = verifyTokenResult.userinfo;
    //写入新token
    /*
    let newToken = await tokenServiceInstance.createToken({
      userInfo: verifyTokenResult.userInfo
    });
    this.header("x-token", newToken);
    */
  }

    //用户信息
  userInfo() {
    return user;
  }
}