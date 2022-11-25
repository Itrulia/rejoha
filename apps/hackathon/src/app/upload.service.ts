import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class UploadService {
  public async uploadFile(filepath: string) {
    const browser = await puppeteer.launch({
      headless: false,
    });

    try {
      const page = await browser.newPage();

      await page.goto('https://create.scribit.design/');
      const loginButtonSelector = '.open-login';
      await page.waitForSelector(loginButtonSelector);
      await page.click(loginButtonSelector);

      await page.waitForSelector('#loginForm');

      await page.type(
        '.form-control[name="email"]',
        process.env['LOGIN_EMAIL']
      );
      await page.type(
        '.form-control[name="password"]',
        process.env['LOGIN_PASSWORD']
      );
      await page.click('#loginForm input[type="submit"]');
      await page.waitForNavigation();

      await page.goto('https://create.scribit.design/design/upload');
      await page.waitForSelector('input[type=file]');

      const inputUploadHandle = await page.$('input[type=file]');
      inputUploadHandle.uploadFile(filepath);

      await page.type('input[name="designName"]', new Date().toISOString());
      await page.click('input[name="public"]');
      await page.select(
        'select[name="coloroneId"]',
        '5c18f178977c352ea85e7b0d'
      );
      await page.evaluate((selector) => {
        (document.querySelector(selector) as HTMLButtonElement).click();
      }, 'input[type="submit"]');

      await page.waitForNavigation();
    } finally {
      await browser.close();
    }
  }
}
