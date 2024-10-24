import { Page } from 'puppeteer';

// Function to scroll through a page and load elements dynamically
export const scrollPage = async (page: Page, scrollElements: string) => {
  let currentElement = 0; // Start with the first element

  while (true) {
    // Get the total number of elements matching the selector
    let elementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);

    // Scroll through each element starting from the current position
    for (; currentElement < elementsLength; currentElement++) {
      await page.setDefaultTimeout(200); // Set a short timeout before each scroll

      // Scroll the current element into view
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

    await page.setDefaultTimeout(5000); // Set a longer timeout to wait for new content to load

    // Check if any new elements have been loaded
    let newElementsLength = await page.evaluate((scrollElements) => {
      return document.querySelectorAll(scrollElements).length;
    }, scrollElements);

    // If no new elements were loaded, exit the loop
    if (newElementsLength === elementsLength) break;
  }
};

// Function to extract data from the page, using a selector for video elements
export const fillDataFromPage = async (
  page: Page,
  requestParams: { baseURL: string; encodedQuery: string },
) =>
  // Evaluate the page and extract the required data from video elements
  await page.evaluate((requestParams) => {
    return Array.from(
      // Select all video renderer elements from the content section
      document.querySelectorAll('#contents > ytd-video-renderer'),
    ).map((el) => ({
      // Get the video title, or default to 'Resource title' if not available
      title:
        el.querySelector('a#video-title')?.textContent?.trim() ??
        'Resource title',

      // Get the video description from the metadata snippet container
      description:
        el
          .querySelector('.metadata-snippet-container > yt-formatted-string')
          ?.textContent?.trim() ?? '',

      // Extract the video ID from the thumbnail link and construct the external URL
      external: `${el.querySelector('a#thumbnail')?.getAttribute('href')?.split('watch?v=')[1]?.split('&')[0]}`,
    }));
  }, requestParams);
