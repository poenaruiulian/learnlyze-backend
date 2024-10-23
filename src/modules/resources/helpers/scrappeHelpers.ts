import { Page } from 'puppeteer';

export const scrollPage = async (page: Page, scrollElements: string) => {
  let currentElement = 0;
  while (true) {
    let elementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);
    for (; currentElement < elementsLength; currentElement++) {
      await page.setDefaultTimeout(200);
      await page.evaluate(
        (currentElement, scrollElements) => {
          document
            .querySelectorAll(scrollElements)
            [currentElement].scrollIntoView();
        },
        currentElement,
        scrollElements,
      );
    }
    await page.setDefaultTimeout(5000);
    let newElementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);
    if (newElementsLength === elementsLength) break;
  }
};

export const fillDataFromPage = async (
  page: Page,
  requestParams: { baseURL: string; encodedQuery: string },
) =>
  await page.evaluate((requestParams) => {
    return Array.from(
      document.querySelectorAll('#contents > ytd-video-renderer'),
    ).map((el) => ({
      title:
        el.querySelector('a#video-title')?.textContent?.trim() ??
        'Resource title',
      description:
        el
          .querySelector('.metadata-snippet-container > yt-formatted-string')
          ?.textContent?.trim() ?? '',
      external: `${el.querySelector('a#thumbnail')?.getAttribute('href')?.split('watch?v=')[1]?.split('&')[0]}`,
    }));
  }, requestParams);
