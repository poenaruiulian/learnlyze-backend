import { ConfigService } from '@nestjs/config';
import { FirstFormGeneratedCourse } from '../interfaces';
import { Resource, ResourceService } from '../../resources';
import { CreateResourceDto } from '../../resources/dto/CreateResourceDto';

export const generateSecondFormSteps = async (
  firstFormGeneratedCourse: FirstFormGeneratedCourse,
  resourceService: ResourceService,
) => {
  const configService = new ConfigService();

  const apiKey = configService.get<string>('YOUTUBE_API_KEY') ?? '';
  const youtubeMainUrl = (keywords: string) =>
    `https://youtube.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&q=${keywords}&relevanceLanguage=en&type=video`;

  return await Promise.all(
    firstFormGeneratedCourse.steps.map(async (step) => {
      const response = await fetch(youtubeMainUrl(step.keywords.join(' ')));

      if (response.ok) {
        const data = await response.json();

        const resources = data.items.map((item: any) => ({
          title: item.snippet.title,
          description: item.snippet.description,
          external: item.id.videoId,
        }));

        resources.forEach((resource: CreateResourceDto) =>
          resourceService.create(resource),
        );

        return {
          ...step,
          resources,
        };
      } else {
        let data = await resourceService
          .scrappeForResources(step.keywords[0])
          .catch((error) => {
            console.log(`DEV_LOG: ${error}`);
            return [];
          });

        if (data.length === 0) {
          console.log(
            'DEV_LOG: The scrapper failed or it did not return anything.',
          );
          data = await resourceService.searchByKeywords(step.keywords);
        } else {
          console.log('DEV_LOG: The scrapper succeeded');
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
  );
};
