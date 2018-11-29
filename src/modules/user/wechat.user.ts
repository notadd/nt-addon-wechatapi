import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { WeChatUtil } from '../../utile/wechat.util';

@Injectable()
export class WechatUser {
  constructor(
    @Inject(WeChatUtil) private readonly wechatUtil: WeChatUtil,
    @Inject(HttpService) private readonly httpService: HttpService
  ) {}

  /**
   * 批量获取用户基本信息,开发者可通过该接口来批量获取用户基本信息。最多支持一次拉取100条。
   * 在关注者与公众号产生消息交互后，公众号可获得关注者的OpenID（加密后的微信号，每个用户对每个公众号的OpenID是唯一的。对于不同公众号，同一用户的openid不同）。公众号可通过本接口来根据OpenID获取用户基本信息，包括昵称、头像、性别、所在城市、语言和关注时间。
   * 请注意，如果开发者有在多个公众号，或在公众号、移动应用之间统一用户帐号的需求，需要前往微信开放平台（open.weixin.qq.com）绑定公众号后，才可利用UnionID机制来满足上述需求。
   * UnionID机制说明：开发者可通过OpenID来获取用户基本信息。特别需要注意的是，如果开发者拥有多个移动应用、网站应用和公众帐号，可通过获取用户基本信息中的unionid来区分用户的唯一性，因为只要是同一个微信开放平台帐号下的移动应用、网站应用和公众帐号，用户的unionid是唯一的。换句话说，同一用户，对同一个微信开放平台下的不同应用，unionid是相同的.
   * parameter 格式：{ "user_list": [
   *     {
   *         "openid": "otvxTs4dckWG7imySrJd6jSi0CWE", （必传）
   *         "lang": "zh_CN" （国家地区语言版本，可不传，默认zh-CN，有多个版本）
   *     }
   * ] }
   * 返回参数：正常情况下，微信会返回下述JSON数据包给公众号（示例中为一次性拉取了2个openid的用户基本信息，第一个是已关注的，第二个是未关注的）:
   * {
   *   "user_info_list": [
   *        {
   *           "subscribe": 1,
   *           "openid": "otvxTs4dckWG7imySrJd6jSi0CWE",
   *           "nickname": "iWithery",
   *           "sex": 1,
   *           "language": "zh_CN",
   *           "city": "揭阳",
   *           "province": "广东",
   *           "country": "中国",
   *
   *          "headimgurl": "http://thirdwx.qlogo.cn/mmopen/xbIQx1GRqdvyqkMMhEaGOX802l1CyqMJNgUzKP8MeAeHFicRDSnZH7FY4XB7p8XHXIf6uJA2SCunTPicGKezDC4saKISzRj3nz/0",
   *
   *          "subscribe_time": 1434093047,
   *           "unionid": "oR5GjjgEhCMJFyzaVZdrxZ2zRRF4",
   *           "remark": "",
   *
   *           "groupid": 0,
   *           "tagid_list":[128,2],
   *           "subscribe_scene": "ADD_SCENE_QR_CODE",
   *           "qr_scene": 98765,
   *           "qr_scene_str": ""
   *
   *      },
   *       {
   *           "subscribe": 0,
   *           "openid": "otvxTs_JZ6SEiP0imdhpi50fuSZg"
   *       }
   *   ]
   * }
   * 参数	                说明
   * subscribe	    用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。
   * openid	        用户的标识，对当前公众号唯一
   * nickname	      用户的昵称
   * sex	          用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
   * city	          用户所在城市
   * country	      用户所在国家
   * province	      用户所在省份
   * language	      用户的语言，简体中文为zh_CN
   * headimgurl	    用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。
   * subscribe_time	用户关注时间，为时间戳。如果用户曾多次关注，则取最后关注时间
   * unionid	      只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。
   * remark	        公众号运营者对粉丝的备注，公众号运营者可在微信公众平台用户管理界面对粉丝添加备注
   * groupid	      用户所在的分组ID（暂时兼容用户分组旧接口）
   * tagid_list	    用户被打上的标签ID列表
   * subscribe_scene	返回用户关注的渠道来源，ADD_SCENE_SEARCH 公众号搜索，ADD_SCENE_ACCOUNT_MIGRATION 公众号迁移，ADD_SCENE_PROFILE_CARD 名片分享，ADD_SCENE_QR_CODE 扫描二维码，ADD_SCENEPROFILE LINK 图文页内名称点击，ADD_SCENE_PROFILE_ITEM 图文页右上角菜单，ADD_SCENE_PAID 支付后关注，ADD_SCENE_OTHERS 其他
   * qr_scene	      二维码扫码场景（开发者自定义）
   * qr_scene_str	  二维码扫码场景描述（开发者自定义）
   * 详情可参考 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140839
   * @param {string} appid （必传）
   * @param parameter （必传）
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async queryUserInformation(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '获取用户基本信息成功!', data};
  }

  /**
   * 公众号可通过本接口来获取帐号的关注者列表，关注者列表由一串OpenID（加密后的微信号，每个用户对每个公众号的OpenID是唯一的）组成。
   * 一次拉取调用最多拉取10000个关注者的OpenID，可以通过多次拉取的方式来满足需求。
   * parameter 格式：{ "nextOpenId":  "OpenId" }
   * 附：关注者数量超过10000时
   * 当公众号关注者数量超过10000时，可通过填写next_openid的值，从而多次拉取列表的方式来满足需求。
   * 具体而言，就是在调用接口时，将上一次调用得到的返回中的next_openid值，作为下一次调用中的next_openid值。
   * 示例：
   * 公众账号A拥有23000个关注的人，想通过拉取关注接口获取所有关注的人，那么分别请求url如下：https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN 返回结果:
   * {
   *  "total":23000,
   *  "count":10000,
   *  "data":{"
   *     openid":[
   *        "OPENID1",
   *       "OPENID2",
   *        ...,
   *        "OPENID10000"
   *      ]
   *   },
   *   "next_openid":"OPENID10000"
   * }https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID1返回结果:
   * {
   *   "total":23000,
   *  "count":10000,
   *   "data":{
   *     "openid":[
   *       "OPENID10001",
   *      "OPENID10002",
   *       ...,
   *       "OPENID20000"
   *     ]
   *   },
   *   "next_openid":"OPENID20000"
   * }https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID2返回结果（关注者列表已返回完时，返回next_openid为空）:
   * {
   *   "total":23000,
   *   "count":3000,
   *   "data":{"
   *       "openid":[
   *         "OPENID20001",
   *         "OPENID20002",
   *         ...,
   *         "OPENID23000"
   *       ]
   *   },
   *   "next_openid":"OPENID23000"
   * }
   * 详情可参考： https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140840
   * @param {string} appid
   * @param parameter
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async queryUserList(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&next_openid=${parameter.nextOpenId}`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '获取关注用户列表成功!', data};
  }
}