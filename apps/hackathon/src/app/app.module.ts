import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadService } from './upload.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, UploadService],
})
export class AppModule {}
