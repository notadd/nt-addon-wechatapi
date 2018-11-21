import { HttpException, HttpService, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WechatTemplate {
  constructor(
    @Inject(HttpService) private readonly httpService: HttpService
  ) {}

  /**
   * 微信模板发信功能，模板需要登录微信公众号里进行设置
   * 每一个模板都有对应的模板Id，模板数据根据你设置的模板，进行相对应的配置
   * 如果缺少某一个参数会有一个500的状态码返回
   * @param {string} openid 接收者openid(必传)
   * @param {string} templateId 模板ID(必传)
   * @param {string} accessToken(必传)
   * @param parameter 	模板数据(必传)
   * @returns {Promise<AxiosResponse<any>>}
   */
  async sendTemplate(openid: string, templateId: string, accessToken: string, parameter: any) {
    try {
      if (!openid) {
        throw new HttpException('openid不存在！！', 500);
      }
      if (!templateId) {
        throw new HttpException('templateId不存在！！', 500);
      }
      if (!accessToken) {
        throw new HttpException('accessToken不存在！！', 500);
      }
      // 访问模板发信服务
      const url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + accessToken + ' ';
      const body = JSON.stringify({
        touser: openid,
        template_id: templateId,
        data: parameter
      });
      const data = await this.httpService.post(url, body).toPromise();
      return data;
    } catch (error) {
      throw new HttpException('发送失败，错误信息： ' + error.toString(), 500);
    }
  }
}