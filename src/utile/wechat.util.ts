import { CACHE_MANAGER, HttpException, HttpService, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WeChatUtil {
  constructor(
    @Inject(HttpService) private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) protected readonly cacheManager: any,
  ) {}

  /**
   *  插件启动 首先访问的第一个方法，公众号会生出一个accountToken被储存在内存中，
   *  用于各种地方，使用appid作为取值参数使用
   * @param {string} appid
   * @param {string} appsecret
   * @returns {Promise<{code: number; message: string}>}
   */
  async weChatGetAccountToken(appid: string, appsecret: string) {
    const url =  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;
    const data = await this.httpService.get(url).toPromise();
    // 请求失败后返回微信接口调用错误时的错误码和错误信息
    if (data.data.errcode) {
      throw new HttpException(data.data.errmsg, data.data.errcode);
    }
    const a = await this.cacheManager.set(appid, data.data.access_token);
    return { code: 200, message: 'AccountToken生成成功!' };
  }

  /**
   * 用户调用方法，测试用于取用户openId
   * @param {string} appid
   * @param {string} appsecret
   * @param {string} authCode
   * @returns {Promise<void>}
   */
  async weChatGetUserAccountToken(appid: string, appsecret: string, authCode: string) {
    let baseApi = 'https://api.weixin.qq.com/sns/oauth2/';
    baseApi += `access_token?appid=${appid}&secret=${appsecret}&code=${authCode}&grant_type=authorization_code`;
    const { data } = await this.httpService.get(baseApi).toPromise();
    // 请求失败后返回微信接口调用错误时的错误码和错误信息
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    // await this.cacheManager.set(data.openid, data.access_token);
    return { code: 200, openId: data.openid };
  }

  /**
   * 用于获取已经存在内存中的accountToken，如果已经过去会返回一个500状态码。
   * @param {string} appId
   * @returns {Promise<any>}
   */
  async ensureAccessToken(appId: string) {
    const accessToken = await this.cacheManager.get(appId);
    if (!accessToken) {
      throw new HttpException('accessToken已过期，请重新调用获取', 500);
    } else {
      return accessToken;
    }
  }
}