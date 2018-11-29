import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { WeChatUtil } from './utile/wechat.util';
import { WechatTemplate } from './modules/template/wechat.template';
import { TestController } from './controller/test.controller';
import { WechatMenu } from './modules/menu/wechat.menu';
import { WechatGrouping } from './modules/grouping/wechat.grouping';
import { WechatUser } from './modules/user/wechat.user';

@Module({
  imports: [CacheModule.register({
    // store: redisStore,
    // host: 'localhost',
    // port: 63799,
    ttl: 60 * 60 * 2 - 10, // 过期时间，因网络延迟等，将实际过期时间提前10秒，以防止临界点
    max: 10, // 缓存项目数
  }), HttpModule],
  controllers: [AppController, TestController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor
    }, AppService, WeChatUtil, WechatTemplate, WechatMenu, WechatGrouping, WechatUser],
})
export class AppModule {}
