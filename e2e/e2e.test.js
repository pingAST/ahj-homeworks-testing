import puppeteer from 'puppeteer';
import { fork } from 'child_process';
import fetch from 'node-fetch';

jest.setTimeout(30000);

describe('Credit Card Validator E2E Tests', () => {
  let browser;
  let page;
  let server;
  const baseUrl = 'http://localhost:9001';

  beforeAll(async () => {

    server = fork(`${__dirname}/e2e.server.js`);

    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => message === 'ok' && resolve());
      setTimeout(reject, 10000, 'Server start timeout');
    });

    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Сервер недоступен: ${response.statusText}`);
    }

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      devtools: true
    });
    page = await browser.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Ошибка в браузере:', msg.text());
      }
    });
  });

  afterAll(async () => {
    await browser.close();
    server.kill('SIGINT');
  });

  describe('Card Validation', () => {
    test('Valid Visa card', async () => {
      console.log('Переход на страницу:', baseUrl);
      await page.goto(baseUrl);
      await page.screenshot({ path: 'screenshots/1-homepage.png' });

      console.log('Проверка загрузки формы');
      await page.waitForSelector('#cardNumber');
      await page.waitForSelector('button[type="submit"]');

      console.log('Ввод номера карты: 4111111111111111');
      await page.type('#cardNumber', '4111111111111111');
      await page.screenshot({ path: 'screenshots/2-after-input.png' });

      console.log('Проверка форматирования');
      const inputValue = await page.$eval('#cardNumber', el => el.value);
      expect(inputValue).toBe('4111 1111 1111 1111');

      console.log('Проверка активной иконки Visa');
      const visaIconClass = await page.$eval('.icon.visa', el => el.className);
      expect(visaIconClass).toContain('active');

      console.log('Отправка формы');
      await page.click('button[type="submit"]');
      await page.screenshot({ path: 'screenshots/3-after-submit.png' });

      console.log('Ожидание результата');
      await page.waitForSelector('#result.valid');
      await page.screenshot({ path: 'screenshots/4-result.png' });

      const resultText = await page.$eval('#result', el => el.textContent);
      expect(resultText).toContain('Карта VISA');
    })

    test('Invalid Luhn check', async () => {
      await page.goto(baseUrl);

      await page.type('#cardNumber', '4111111111111112');
      await page.click('button[type="submit"]');

      await page.waitForSelector('#result.invalid');
      const resultText = await page.$eval('#result', el => el.textContent);
      await page.screenshot({ path: 'screenshots/5-invalid-input.png' });
      expect(resultText).toContain('Неверный номер карты');
    });

    test('Unknown payment system', async () => {
      await page.goto(baseUrl);

      await page.type('#cardNumber', '1234567812345678');
      await page.click('button[type="submit"]');

      await page.waitForSelector('#result.invalid');
      const resultText = await page.$eval('#result', el => el.textContent);
      await page.screenshot({ path: 'screenshots/6-invalid-result.png' });
      expect(resultText).toContain('Неизвестная платежная система');
    });

    test('Auto-formatting input', async () => {
      await page.goto(baseUrl);

      await page.type('#cardNumber', '3530111333300000');

      const inputValue = await page.$eval('#cardNumber', el => el.value);
      expect(inputValue).toBe('3530 1113 3330 0000');
    });

    test('Mastercard validation', async () => {
      await page.goto(baseUrl);

      await page.type('#cardNumber', '5555555555554444');

      // Проверка активной иконки
      const masterIconClass = await page.$eval('.icon.mastercard', el => el.className);
      expect(masterIconClass).toContain('active');

      await page.click('button[type="submit"]');

      await page.waitForSelector('#result.valid');
      const resultText = await page.$eval('#result', el => el.textContent);
      expect(resultText).toContain('MASTERCARD');
    });
  });
});
