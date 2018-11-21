import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { WeChatUtil } from '../utile/wechat.util';
import { WechatTemplate } from '../modules/template/wechat.template';

@Controller('test')
export class TestController {
  constructor(
    @Inject(WeChatUtil)
    private readonly wechatUtil: WeChatUtil,
    @Inject(WechatTemplate)
    private readonly wechatTemplate: WechatTemplate
  ) {}


  @Post('weChatGetAccountToken')
  async weChatGetAccountToken(@Req() req, @Body() body: {appId: string, appsecret: string}) {
    const { appId, appsecret } = body;
    const data = await this.wechatUtil.weChatGetAccountToken(appId, appsecret);
    return data;
  }

  // 测试用
  @Post('weChatGetUserAccountToken')
  async weChatGetUserAccountToken(@Req() req, @Body() body: {appId: string, appsecret: string, authCode: string}) {
    const { appId, appsecret, authCode } = body;
    const data = await this.wechatUtil.weChatGetUserAccountToken(appId, appsecret, authCode);
    return data;
  }

  @Post('template')
  async templateController(@Req() req, @Body() body: {recipientOpenId: string, templateId: string, appId: string, parameter: any}) {
    const {recipientOpenId, templateId, appId, parameter} = body;
    const accessToken: string = await this.wechatUtil.ensureAccessToken(appId);
    const data = await this.wechatTemplate.sendTemplate(recipientOpenId, templateId, accessToken, parameter);
    return data;
  }
}