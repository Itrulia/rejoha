import { Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { writeFileSync } from 'fs';
import { UploadService } from './upload.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private uploadService: UploadService
  ) {}

  @Get(':id')
  public async getData(@Param('id') id: string) {
    const data = await this.appService.getData(id);

    writeFileSync('my-svg.svg', data);

    await this.uploadService.uploadFile('my-svg.svg');

    return data;
  }

  // @Post(':id')
  // public uploadData(@Param() id: string) {}
}
