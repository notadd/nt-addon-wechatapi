import { WeChatUtil } from '../../utile/wechat.util';
import { CACHE_MANAGER, HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WechatSdk {
  constructor(
    @Inject(WeChatUtil) private readonly wechatUtil: WeChatUtil,
    @Inject(HttpService) private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
  ) {}

  /**
   * sdk 签名算法
   * @param {string} appid （必传）用于取 jsapi_ticket
   * @param {string} url （必传） 用于签名的url，注意必须与调用JSAPI时的页面URL完全一致
   * @returns {Promise<string>}
   * 注意事项:
   * 1.签名用的noncestr和timestamp必须与wx.config中的nonceStr和timestamp相同。
   * 2.签名用的url必须是调用JS接口页面的完整URL。
   * 详情请参开微信公众平台js-sdk附录一，https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
   */
  async signatureAlgorithm (nonceStr: string, timestamp: string, appid: string, url: string) {
    const ticket = await this.getTicket(appid);
    const ret = { jsapi_ticket: ticket, nonceStr,  timestamp, url};
    const str = await this.wechatUtil.sortQuery(ret);
    const shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
  }

  /**
   * 获取jsapi_ticket
   * jsapi_ticket是公众号用于调用微信JS接口的临时票据。
   * 正常情况下，jsapi_ticket的有效期为7200秒，通过access_token来获取。
   * 由于获取jsapi_ticket的api调用次数非常有限，频繁刷新jsapi_ticket会导致api调用受限，影响自身业务，开发者必须在自己的服务全局缓存jsapi_ticket 。
   * @param {string} appid （必传） 用于存jsapi_ticket
   * @returns {Promise<any>}
   */
  async getTicket(appid: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const ticket = await this.cacheManager.get(appid);
    if (ticket) {
      return ticket;
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    await this.cacheManager.set(appid, data.data.ticket);
    return ticket;
  }

  /**
   * 获取JsSdk wx.config接口所需的参数
   * @param {string} appid （必传）
   * @param {string} url （必传） 用于签名的url，注意必须与调用JSAPI时的页面URL完全一致
   * @returns {Promise<{nonceStr: any; timestamp: string; signature: string}>}
   */
  async getJsSdkConfig(appid: string, url: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    if (!url) {
      throw new HttpException('url不存在！！', 500);
    }
    const nonceStr = await this.wechatUtil.generatingRandomNumbers();
    const timestamp = await this.wechatUtil.generationTimestamp();
    const signature = await this.signatureAlgorithm(nonceStr, timestamp, appid, url);
    return {nonceStr, timestamp, signature};
  }
}