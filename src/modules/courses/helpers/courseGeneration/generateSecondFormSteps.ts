import { ConfigService } from '@nestjs/config';
import { FirstFormGeneratedCourse } from '../../interfaces';
import { Resource, ResourceService } from '../../../resources';
import { CreateResourceDto } from '../../../resources/dto/CreateResourceDto';
import { Logger } from '../../../../common';

export const generateSecondFormSteps = async (
  firstFormGeneratedCourse: FirstFormGeneratedCourse,
  resourceService: ResourceService,
) => {
  const configService = new ConfigService();

  const apiKey = configService.get<string>('YOUTUBE_API_KEY') ?? '';
  const youtubeMainUrl = (keywords: string) =>
    `https://youtube.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&q=${keywords}&relevanceLanguage=en&type=video`;

  if (!firstFormGeneratedCourse.steps) {
    Logger.error('No steps found from the first step');
    return null;
  }

  return await Promise.all(
    // For each step from the course we want to generate resources
    firstFormGeneratedCourse.steps.map(async (step) => {
      // We first try to use the YouTube API to fetch the resources
      const response = await fetch(youtubeMainUrl(step.keywords.join(' ')));

      if (response.ok) {
        // If the response returns data
        const data = await response.json();

        // We map through the given data to make it match to our needs
        const resources = data.items.map((item: any) => ({
          title: item.snippet.title,
          description: item.snippet.description,
          external: item.id.videoId,
        }));

        // And save them in the database for easier access
        resources.forEach((resource: CreateResourceDto) =>
          resourceService.create(resource),
        );

        return {
          ...step,
          resources,
        };
      } else {
        // In case of failure we still want to give the user resources so we scrappe for them using Puppeteer
        let data = await resourceService
          .scrappeForResources(step.keywords[0])
          .catch((error) => {
            Logger.error(error);
            return [];
          });

        if (data.length === 0) {
          // If we fail again to retrieve data for the user we will try and get data from our database, searching through the saved resources
          Logger.error('The scrapper failed or it did not return anything.');
          data = await resourceService.searchByKeywords(step.keywords);
        } else {
          Logger.log('The scrapper succeeded.');
          // In this case we save the data from the scrapper to the database
          data.forEach((resource: CreateResourceDto) =>
            resourceService.create(resource),
          );
        }

        const resources: Omit<Resource, 'id'>[] = data.map(
          (resource: Resource) => ({
            title: resource.title,
            description: resource.description,
            external: resource.external,
          }),
        );

        return {
          ...step,
          resources,
        };
      }
    }),
  ).catch((error) => {
    Logger.error(error);
    return null;
  });
};
