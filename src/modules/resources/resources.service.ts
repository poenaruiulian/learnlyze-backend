import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities';
import { CreateResourceDto } from './dto/CreateResourceDto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
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
  async create(createResourceDto: CreateResourceDto) {
    const resource = new Resource();

    resource.description = createResourceDto.description;
    resource.title = createResourceDto.title;
    resource.external = createResourceDto.external;

    return await this.resourceRepository.save(resource);
  }
}
