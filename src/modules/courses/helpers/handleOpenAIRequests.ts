import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const firstFormGeneratedCoursePrompt = (description: string) => `
  Project: 
    Develop a learning application where the users can create courses based on a short description. They will have the possibility to modify those courses later.
  
  Role: 
    ChatGPT role is to create the course for the user using a set of proprieties described below, based on a description given by the user. You should generate the course as a strategist and a teacher.
  
  Context: 
    The course you are generating will be used by the user to learn a new skill. This is skill is described as follows: ${description}. Understand the description and proceed.
    Each course is has more components:
      1. Title - a descriptive title for the course based on the current learning skill
      2. Steps - a course has more steps the user needs to follow to master that specific skill, each step must also include some steps that will be described below.
    Each step provided for a course should contain:
      1. Title - a descriptive title for the step based on the representation of what a user will learn on this step
      2. Keywords - these keywords are special words or sentences that the user can use to search on Youtube for good quality explanations regarding the step provided
    Every course must contain the above needed components, the titles should be kept short, so the user can better memorize them.
    
    Output specifications: 
      The answer will be later processed and used to generate more data and store to a database. 
      The answer need to be in a JSON format that can be later converted to an object. 
      Don't add any other unnecessary comments to the answer, just the JSON stringyfied object that should look like in the example below.
      Don't add at the start of the answer '\`\`\`json\\n' and don't add at the end \\n. Just give the simple stringyfied JSON object as described below. 
      Your response will later be used as JSON.parse(response) so don't generate a response that could cause any of the below errors:
         ERROR [ExceptionsHandler] Expected ',' or ']' after array element in JSON at position...
         SyntaxError: Unexpected token '\`', \\"\`\`\`json
    
    Output example: I will give you an example regarding how the answer should look. The answer should be just a stringyfied JSON object from a JSON object looking like so:
    {"title": "Learning C/C++","steps": [{"number": 1,"title": "Variables and how to initialize them","keywords": ["C/C++ variables", "C/C++ data types"],},{"number": 2,"title": "Operators in C/C++","keywords": ["C/C++ operators", "arithmetic operators", "logical operators"]}}
    The above is an example of how the data must be structured. 
  
`;

const secondFormGeneratedCoursePrompt = (description: string) => `
  Project: 
    Develop a learning application where the users can create courses based on a short description. They will have the possibility to modify those courses later.
    
  Role:
    ChatGPT role is to understand the giving course, analyze all the resources presented and select 3 (or 2 if you see fit) best resources that are following the given title and keywords.
  
  Context:
    The new course you will generate will be used by the user to learn a new skill. The user needs resources to follow and understand the concept presented in the title of the step. I will provide below how the data you are going to analyze will look, you need only to analyze the data and select the best resources from the list of the resources.
    The input data is: ${description} and you will format the output in the same manner but respecting the Output specification and Output example rules presented down below.
  
  Output specifications: 
    The output you will provide needs to be the in the same format as the input, except of the filtering of the resources. To understand how this data will be used in the future, the videos will be scanned and summarized so the user has a short description of the chapter.
    The answer need to be in a JSON format that can be later converted to an object. 
    Don't add any other unnecessary comments to the answer, just the JSON stringyfied object that should look like in the example below.
    Don't add at the start of the answer '\`\`\`json\\n' and don't add at the end \\n. Just give the simple stringyfied JSON object as described below. 
    Your response will later be used as JSON.parse(response) so don't generate a response that could cause any of the below errors:
      ERROR [ExceptionsHandler] Expected ',' or ']' after array element in JSON at position... 
      SyntaxError: Unexpected token '\`', \\"\`\`\`json
   
  Output example: The output should look identical as structure with input, but a shorter list of resources. The list of resources is shorter because you will be selecting the 3 (or 2) best resources for the user to follow for that specific step. 
`;

export const handleOpenAIRequests = async ({
  type,
  description,
}: {
  type: 'firstFormGeneratedCoursePrompt' | 'secondFormGeneratedCoursePrompt';
  description: any;
}) => {
  const configService = new ConfigService();

  const prompt =
    type === 'firstFormGeneratedCoursePrompt'
      ? firstFormGeneratedCoursePrompt(description)
      : secondFormGeneratedCoursePrompt(description);

  const openai = new OpenAI({
    apiKey: configService.get<string>('OPENAI_API_KEY'),
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
};
