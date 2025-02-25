import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities';
import { CreateResourceDto } from './dto/CreateResourceDto';
import { InjectCore, PuppeteerCore } from 'nestjs-pptr';
import { Page } from 'puppeteer';
import { fillDataFromPage, scrollPage } from './helpers';
import { StepsService } from '../steps';
import {
  handleOpenAIRequests,
  Logger,
  StepNotFoundException,
  ResourceNotFoundException,
  NewSearchPhraseFailedException,
  ResourceGenerationFailedException,
  ErrorDescriptions,
} from '../../common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectCore() private readonly puppeteer: PuppeteerCore,
    @Inject(forwardRef(() => StepsService)) private stepService: StepsService,
  ) {}

  async searchByKeywords(keywords: string[]): Promise<Resource[]> {
    // If no keywords provided, return an empty array
    if (keywords.length === 0) {
      return [];
    }

    // Start building a query using TypeORM's QueryBuilder
    const query = this.resourceRepository.createQueryBuilder('resource');

    // Preprocess keywords to improve search flexibility
    const processedKeywords = keywords.flatMap((keyword) => {
      // Convert to lowercase and replace '/' with space
      const processed = keyword.toLowerCase().replace(/[/]/g, ' ');
      // Split into individual words and filter out words shorter than 2 characters
      return processed.split(/\s+/).filter((k) => k.length > 1);
    });

    // Construct WHERE clause for flexible matching - we verify if resource's title or description are alike :keyword{index}
    // The :keyword{index} is defined through params, the object representing query params
    const whereConditions = processedKeywords.map(
      (_, index) => `
    (
      LOWER(resource.title) LIKE :keyword${index}
      OR LOWER(resource.description) LIKE :keyword${index}
    )
  `,
    );

    // Combine all conditions with OR, allowing partial matches
    query.where(`(${whereConditions.join(' OR ')})`);

    // Set up query parameters
    const params: Record<string, string> = {};
    processedKeywords.forEach((keyword, index) => {
      // Use LIKE with wildcards for partial matching
      params[`keyword${index}`] = `%${keyword}%`;
    });

    // Apply parameters to the query
    query.setParameters(params);

    // Construct relevance scoring logic = rank search results based on how well they match the user’s query
    const relevanceScore = processedKeywords
      .map(
        (_, index) => `
    (CASE
      WHEN LOWER(resource.title) LIKE :keyword${index} THEN 3
      WHEN LOWER(resource.description) LIKE :keyword${index} THEN 1
      ELSE 0
    END)
  `,
      )
      .join(' + ');

    // Add relevance score to query and order results
    query
      .addSelect(`(${relevanceScore})`, 'relevance_score')
      .orderBy('relevance_score', 'DESC')
      .addOrderBy('resource.id', 'ASC'); // Secondary ordering for consistent results

    // Limit the number of results
    query.limit(10);

    // Execute the query and return results
    return await query.getMany();
  }

  async scrappeForResources(keyword: string) {
    const requestParams = {
      baseURL: `https://www.youtube.com`,
      encodedQuery: encodeURI(keyword),
    };

    // We create the instance of the puppeteer
    const instance = await this.puppeteer.launch('example', {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    // Open a new YouTube page
    let page: Page | null = null;

    page = await instance.browser.newPage();

    // Set a more realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    );

    // We create the search URL based on the given keyword
    const URL = `${requestParams.baseURL}/results?search_query=${requestParams.encodedQuery}`;

    // And we navigate to it
    await page.goto(URL);

    // We wait for all the videos from the rendered page
    await page.waitForSelector('#contents > ytd-video-renderer');

    // And we select them all
    const scrollElements = '#contents > ytd-video-renderer';

    await scrollPage(page, scrollElements);

    await page.setDefaultTimeout(10000);

    const organicResults = await fillDataFromPage(page, requestParams);

    if (page) {
      await page.close();
    }
    await this.puppeteer.destroy(instance);
    await this.puppeteer.closeAll();

    return organicResults;
  }

  async create(createResourceDto: CreateResourceDto) {
    const resource = new Resource();

    resource.description = createResourceDto.description;
    resource.title = createResourceDto.title;
    resource.external = createResourceDto.external;

    return await this.resourceRepository.save(resource);
  }

  async findOneByExternal(external: string) {
    return await this.resourceRepository.findOne({ where: { external } });
  }

  async findOneById(id: number) {
    return await this.resourceRepository.findOneBy({ id });
  }

  async replace({
    stepId,
    resourceId,
    feedback,
  }: {
    stepId: number;
    resourceId: number;
    feedback: string;
  }) {
    const foundResource = await this.findOneById(resourceId);
    const foundStep = await this.stepService.findOneById(stepId);

    if (!foundStep) {
      throw new StepNotFoundException();
    }

    if (!foundResource) {
      throw new ResourceNotFoundException();
    }

    const newSearchPhrase = await handleOpenAIRequests({
      description: {
        feedback,
        resourceTitle: foundResource.title,
        resourceDescription: foundResource.description,
        stepDescription: foundStep.description,
      },
      type: 'recommendSearchPhrase',
    });

    if (!newSearchPhrase) {
      Logger.error(ErrorDescriptions.newSearchPhraseFailed);
      throw new NewSearchPhraseFailedException();
    }

    const configService = new ConfigService();

    const apiKey = configService.get<string>('YOUTUBE_API_KEY') ?? '';
    const youtubeMainUrl = (keywords: string) =>
      `https://youtube.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&q=${keywords}&relevanceLanguage=en&type=video`;

    // We first try to use the YouTube API to fetch the resources
    const response = await fetch(youtubeMainUrl(newSearchPhrase));

    let resource: {
      title: string;
      description: string;
      external: string;
    } | null = null;

    if (response.ok) {
      // If the response returns data
      const data = await response.json();

      resource = data.items.map((item: any) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        external: item.id.videoId,
      }))[0];
    } else {
      // In case of failure we still want to give the user resources so we scrappe for them using Puppeteer
      let resources = await this.scrappeForResources(newSearchPhrase).catch(
        (error) => {
          Logger.error(error);
          return [];
        },
      );

      if (resources.length === 0) {
        // If we fail again to retrieve data for the user we will try and get data from our database, searching through the saved resources
        Logger.error('The scrapper failed or it did not return anything.');
        resources = await this.searchByKeywords(newSearchPhrase.split(''));
      } else {
        Logger.log('The scrapper succeeded.');
      }

      resource = resources[0];
    }

    if (!resource) {
      throw new ResourceGenerationFailedException();
    }

    // If the resource was created successfully then we add it to the database
    // and replace the old resource id with the newly created resource.

    const newResource = await this.create(resource);

    foundStep.resources = foundStep.resources.map((resId) =>
      resId === resourceId ? newResource.id : resId,
    );

    await this.stepService.save(foundStep);

    return newResource;
  }
}
