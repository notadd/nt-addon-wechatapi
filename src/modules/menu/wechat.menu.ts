import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';
import { WeChatUtil } from '../../utile/wechat.util';

@Injectable()
export class WechatMenu {
  constructor(
    @Inject(WeChatUtil) private readonly wechatUtil: WeChatUtil,
    @Inject(HttpService) private readonly httpService: HttpService
  ) {}

  /**
   * 创建菜单
   * @param {string} appid 必须要的参数,用来取AccessToken（必传）
   * @param parameter 创建菜单所需要的参数（必传）
   * @returns {Promise<{code: number; message: string}>}
   */
  async createMenu(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '创建菜单成功!'};
  }

  /**
   * 查询当前公众号创建的菜单，另外请注意，在设置了个性化菜单后，使用本自定义菜单查询接口可以获取默认菜单和全部个性化菜单信息。
   * @param {string} appid （必传）
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async queryMenu(appid: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${accessToken}`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '查询菜单成功!', data};
  }

  /**
   * 删除菜单，另请注意，在个性化菜单时，调用此接口会删除默认菜单及全部个性化菜单。
   * @param {string} appid （必传）
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async deleteMenu(appid: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${accessToken}`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.errcode !== 0) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '删除菜单成功!', data};
  }

  /**
   * 创建针对用户的个性化菜单
   * 开发者可以通过以下条件来设置用户看到的菜单：
   * 1、用户标签（开发者的业务需求可以借助用户标签来完成）
   * 2、性别
   * 3、手机操作系统
   * 4、地区（用户在微信客户端设置的地区）
   * 5、语言（用户在微信客户端设置的语言）
   * 接口说明：
   * 1、个性化菜单要求用户的微信客户端版本在iPhone6.2.2，Android 6.2.4以上，暂时不支持其他版本微信
   * 2、菜单的刷新策略是，在用户进入公众号会话页或公众号profile页时，如果发现上一次拉取菜单的请求在5分钟以前，就会拉取一下菜单，如果菜单有更新，就会刷新客户端的菜单。测试时可以尝试取消关注公众账号后再次关注，则可以看到创建后的效果
   * 3、普通公众号的个性化菜单的新增接口每日限制次数为2000次，删除接口也是2000次，测试个性化菜单匹配结果接口为20000次
   * 4、出于安全考虑，一个公众号的所有个性化菜单，最多只能设置为跳转到3个域名下的链接
   * 5、创建个性化菜单之前必须先创建默认菜单（默认菜单是指使用普通自定义菜单创建接口创建的菜单）。如果删除默认菜单，个性化菜单也会全部删除
   * 6、个性化菜单接口支持用户标签，请开发者注意，当用户身上的标签超过1个时，以最后打上的标签为匹配
   * 匹配说明：
   * 个性化菜单的更新是会被覆盖的。
   * 创建个性化菜单前必须要先发布默认菜单
   * 例如公众号先后发布了默认菜单，个性化菜单1，个性化菜单2，个性化菜单3。那么当用户进入公众号页面时，将从个性化菜单3开始匹配，如果个性化菜单3匹配成功，则直接返回个性化菜单3，否则继续尝试匹配个性化菜单2，直到成功匹配到一个菜单。
   * 根据上述匹配规则，为了避免菜单生效时间的混淆，决定不予提供个性化菜单编辑API，开发者需要更新菜单时，需将完整配置重新发布一轮。
   * menuid 用于后面删除某一个发布的个性化菜单使用，或者也可以直接调用 deleteMenu() 删光后重新创建
   * @param {string} appid （必传）
   * @param parameter 创建个性化菜单必须要的参数（必传）
   * @returns {Promise<{code: number; message: string; menuid: string}>}
   */
  async createPersonalizedMenu(appid: string, parameter: any) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '创建个性化菜单成功!', menuid: data.menuid};
  }

  /**
   * 根据menuid删除对应的个性化菜单
   * @param {string} appid （必传）
   * @param {string} parameter （必传）
   * @returns {Promise<{code: number; message: string; menuid: any}>}
   */
  async deletePersonalizedMenu(appid: string, parameter: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/delconditional?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode !== 0) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '删除个性化菜单成功!'};
  }

  /**
   * 测试个性化菜单匹配结果
   * @param {string} appid （必传）
   * @param {string} parameter （必传）
   * 请求示例：
   * {"user_id":"weixin"}  user_id可以是粉丝的OpenID，也可以是粉丝的微信号，将返回菜单配置
   * @returns {Promise<{code: number; message: string; data: any}>}
   */
  async testPersonalizedMenu(appid: string, parameter: string) {
    if (!appid) {
      throw new HttpException('appid不存在！！', 500);
    }
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appid);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/trymatch?access_token=${accessToken}`;
    const { data } = await this.httpService.post(url, parameter).toPromise();
    if (data.errcode) {
      throw new HttpException(data.errmsg, data.errcode);
    }
    return { code: 200, message: '测试成功!', data};
  }

}