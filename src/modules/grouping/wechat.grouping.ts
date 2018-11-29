import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { WeChatUtil } from '../../utile/wechat.util';

@Injectable()
export class WechatGrouping {
  constructor(
    @Inject(WeChatUtil) private readonly wechatUtil: WeChatUtil,
    @Inject(HttpService) private readonly httpService: HttpService
  ) {}

  /**
   * 创建用户分组标签，一个公众号，最多可以创建100个标签。
   * parameter 格式：{   "tag" : {     "name" : "广东"//标签名   } }
   * 返回参数：{   "tag":{ "id":134,//标签id "name":"广东"   } }
   * @param {string} appid （必传）
   * @param parameter（必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async createUserLabel(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '创建用户标签成功!'};
  }

  /**
   * 获取公众号已创建的标签
   * @param {string} appid （必传）
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async queryUserLabel(appid: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${accessToken}`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '查询菜单成功!', data};
  }

  /**
   * 编辑公众号以建立好的标签
   * parameter 格式：{   "tag" : {     "id" : 134,     "name" : "广东人"   } }
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async updateUserLabel(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/update?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '修改用户标签成功!'};
  }

  /**
   * 删除公众号里的标签
   * 请注意，当某个标签下的粉丝超过10w时，后台不可直接删除标签。
   * 此时，开发者可以对该标签下的openid列表，先进行取消标签的操作，直到粉丝数不超过10w后，才可直接删除该标签。
   * parameter 格式：{   "tag":{        "id" : 134   } }
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async deleteUserLabel(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '删除用户标签成功!'};
  }

  // 此方法暂时有一个问题，过后解决 get传 json参数bug
  // async queryUserLabelFans(appid: string, parameter: any) {
  //   if (!appid) {
  //     throw new HttpException('appid不存在！！', 500);
  //   }
  //   const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
  //   const url = `https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${accessToken}`;
  //   const { data } = await this.httpService.get(url).toPromise();
  //   if (data.errcode) {
  //     throw new HttpException(data.errmsg, data.errcode);
  //   }
  //   return { code: 200, message: '查询菜单成功!', data};
  // }

  /**
   * 批量为用户打标签,标签功能目前支持公众号为用户打上最多20个标签。
   * parameter 格式：{"openid_list" : [//粉丝列表 "ocYxcuAEy30bX0NXmGn4ypqx3tI0", "ocYxcuBt0mRugKZ7tGAHPnUaOW7Y"   ],  "tagid" : 134 }
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async batchAdditionUser(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '批量为用户添加标签成功!'};
  }

  /**
   * 批量为用户取消标签
   * parameter 格式：{"openid_list" : [//粉丝列表 "ocYxcuAEy30bX0NXmGn4ypqx3tI0", "ocYxcuBt0mRugKZ7tGAHPnUaOW7Y"   ],  "tagid" : 134 }
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async batchCancellation(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '批量为用户取消标签成功!'};
  }

  /**
   * 获取用户身上的标签列表
   * parameter 格式：{  "openid" : "ocYxcuBt0mRugKZ7tGAHPnUaOW7Y" }
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async queryUserLabelList(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '查询用户身上所属标签成功!', data};
  }

}