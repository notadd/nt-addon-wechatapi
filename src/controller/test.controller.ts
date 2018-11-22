import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { WeChatUtil } from '../utile/wechat.util';
import { WechatTemplate } from '../modules/template/wechat.template';
import { WechatMenu } from '../modules/menu/wechat.menu';

@Controller('test')
export class TestController {
  constructor(
    @Inject(WeChatUtil)
    private readonly wechatUtil: WeChatUtil,
    @Inject(WechatTemplate)
    private readonly wechatTemplate: WechatTemplate,
    @Inject(WechatMenu)
    private readonly wechatMenu: WechatMenu
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

  @Post('createMenu')
  async createMenu(@Req() req, @Body() body: {appid: string, parameter: any}) {
    const {appid, parameter} = body;
    const data = await this.wechatMenu.createMenu(appid, parameter);
    return data;
  }

  @Post('queryMenu')
  async queryMenu(@Req() req, @Body() body: {appid: string}) {
    const { appid } = body;
    const data = await this.wechatMenu.queryMenu(appid);
    return data;
  }

  @Post('deleteMenu')
  async deleteMenu(@Req() req, @Body() body: {appid: string}) {
    const { appid } = body;
    const data = await this.wechatMenu.deleteMenu(appid);
    return data;
  }

  @Post('createPersonalizedMenu')
  async createPersonalizedMenu(@Req() req, @Body() body: {appid: string, parameter: any}) {
    const {appid, parameter} = body;
    const data = await this.wechatMenu.createPersonalizedMenu(appid, parameter);
    return data;
  }

  @Post('deletePersonalizedMenu')
  async deletePersonalizedMenu(@Req() req, @Body() body: {appid: string, parameter: any}) {
    const {appid, parameter} = body;
    const data = await this.wechatMenu.deletePersonalizedMenu(appid, parameter);
    return data;
  }

  @Post('testPersonalizedMenu')
  async testPersonalizedMenu(@Req() req, @Body() body: {appid: string, parameter: any}) {
    const {appid, parameter} = body;
    const data = await this.wechatMenu.testPersonalizedMenu(appid, parameter);
    return data;
  }
}