import { Global, Module } from '@nestjs/common';
import { provideSiteOrigin, SITE_ORIGIN } from './core/config/site-origin';

@Global()
@Module({
    providers: [provideSiteOrigin()],
    exports: [SITE_ORIGIN]
})
export class GlobalModule {}
