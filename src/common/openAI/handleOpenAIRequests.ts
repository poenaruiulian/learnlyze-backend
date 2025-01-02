import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Logger } from '../index';

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
    
    Ensure that the response is a valid JSON string. Before returning the response, internally validate it to make sure it can be parsed by \`JSON.parse()\` without errors.
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
  
  Ensure that the response is a valid JSON string. Before returning the response, internally validate it to make sure it can be parsed by \`JSON.parse()\` without errors. 
`;

const generateDescriptionTitleBasedPrompt = (description: string) => `
  Project: 
    Develop a learning application where users can create courses based on a short description. Users will have the ability to modify these courses later.

  Role:
    ChatGPT’s role is to understand each title in a list and generate a detailed, educational description for each one. The goal is to help someone with no prior knowledge understand the subject thoroughly.
  
  Context:
    You will receive a list of titles, each representing a step in a course that the user is learning to acquire a new skill. For each title, you need to provide a comprehensive, standalone description in HTML format, as if explaining it to a student with no background knowledge.
  
    For each title:
    - Start with a high-level overview to introduce the topic and explain its importance.
    - Break down the main concepts, defining key terms and providing background where necessary.
    - Use real-world examples and applications to illustrate each concept.
    - If the topic is complex, include a step-by-step example to help clarify the ideas.
    - Address common misconceptions or frequently asked questions to clear up potential confusion.
    - Conclude with a summary to reinforce key points.
    - Be as detailed as possible to make sure the user understand evrything there is of the subject.
  
  Output specifications:
    Return a list of single strings where each string is a complete HTML-formatted description for one title.
    Each string should contain well-structured HTML without inline styles and may use bullet points, bold, italic, and underline tags to organize the content.
    Ensure the output is JSON-serializable, meaning each HTML string should not contain any line breaks or extra characters that would break JSON formatting.
    Don't add any other unnecessary comments to the answer, just the JSON stringyfied object that should look like in the example below.
    Don't add at the start of the answer '\`\`\`json\\n' and don't add at the end \\n. Just give the simple stringyfied JSON object as described below.
    Your response will later be used as JSON.parse(response) so don't generate a response that could cause any of the below errors:
      ERROR [ExceptionsHandler] Expected ',' or ']' after array element in JSON at position... 
      SyntaxError: Unexpected token '\`', \\"\`\`\`json
    Give me the answer as a string that can be later use in a JSON.parse(), don't use any of the above notation that includes '\`\`\`json\\n' at the start of the answer. 

  
  List of Titles: ${description}
  
  Example Output (for a title called "Templates and Standard Library"):
    "<p>Templates in C++ allow functions and classes to work with any data type, making code flexible and reusable. By using <b>templates</b>, you can write a function or class once and use it with different data types without rewriting the code...</p><h3>Another Title Example</h3><p>Here is another detailed explanation</p> ...",
  
  Note: Each item in the list should correspond directly to a title in the provided list, and each HTML string should be a standalone description that can be displayed independently in the application.
`;

const generateSubSteps = ({
  title,
  description,
  feedback,
}: {
  title: string;
  description: string;
  feedback: string;
}) => `
  Project: 
    Develop a learning application where the users can create courses based on a short description. They will have the possibility to modify those courses later.
  
  Role: 
    ChatGPT role is to understand the given step and why it could be difficult to a user to understand and learn. After that you need to think from a teacher perspective.
    
  Context: 
    You will receive a title and a description of a step the user did not understand. The user might gave a feedback for which why he did not understood, but if the feedback is not specific you should consider the step too complicated for the user to understand. 
    In any case you should analyze the title and description of step and create only one set of substeps to better understand the notions in the provided step.
    If there is specific feedback analyze it and create the set of substeps based on that description so the user understands better the notions provided in the first place.
    Each step provided for a course should contain:
      1. Title - a descriptive title for the step based on the representation of what a user will learn on this step
      2. Keywords - these keywords are special words or sentences that the user can use to search on Youtube for good quality explanations regarding the step provided
    The title of the step you need to create a set of substeps is ${title} and the description is ${description}. The user offered as feedback: ${feedback}. Take these into consideration when generating the substeps and feedback too if it is specific.
   
  Output specifications: 
    The answer will be later processed and used to generate more data and store to a database. 
    The answer need to be in a JSON format that can be later converted to an object. 
    Don't add any other unnecessary comments to the answer, just the JSON stringyfied object that should look like in the example below.
    Don't add at the start of the answer '\`\`\`json\\n' and don't add at the end \\n. Just give the simple stringyfied JSON object as described below. 
    Your response will later be used as JSON.parse(response) so don't generate a response that could cause any of the below errors:
         ERROR [ExceptionsHandler] Expected ',' or ']' after array element in JSON at position...
         SyntaxError: Unexpected token '\`', \\"\`\`\`json
  
  Output example: I will give you an example regarding how the answer should look. The answer should be just a stringyfied JSON object from a JSON object looking like so:
    [{"number": 1,"title": "Variables and how to initialize them","keywords": ["C/C++ variables", "C/C++ data types"],},{"number": 2,"title": "Operators in C/C++","keywords": ["C/C++ operators", "arithmetic operators", "logical operators"]}]
    The above is an example of how the data must be structured. 
`;

const recommendSearchPhrase = ({
  resourceTitle,
  resourceDescription,
  stepDescription,
  feedback,
}: {
  resourceTitle: string;
  resourceDescription: string;
  stepDescription: string;
  feedback: string;
}) => `
  Project: 
    Develop a learning application where the users can create courses based on a short description. They will have the possibility to modify those courses later.
  
  Role: 
    ChatGPT role is to analyze the feedback on why a resource was not good enough and based on the feedback and step description to give a good phrase that be used to search on Youtube for another resource.
  
  Context:
    You will receive a title of resource that can or can't be useful, the description of the step the resource was recommended and the user feedback.
    If the feedback is useful and coherent use it to recommend a phrase that can be latter used to replace the resource with another.
    Use the step description and feedback to suggest a good phrase. The title and resource description are given so you can understand what could be wrong with the resource.
    Also use the description and title of the resource so you can recommend a search phrase that could give something similar similar but better.
    The title of the resource is ${resourceTitle} and the description of the resource is ${resourceDescription}, the description of the step is ${stepDescription} and the feedback of the user is ${feedback}
    
   Output specification: 
    The output should be fairly short sentence.
   
   Output example:
    "A phrase to search with" or "How to search something?" or "Learning something" 
  `;

export const handleOpenAIRequests = async ({
  type,
  description,
}: {
  type:
    | 'firstFormGeneratedCoursePrompt'
    | 'secondFormGeneratedCoursePrompt'
    | 'generateDescriptionTitleBased'
    | 'generateSubSteps'
    | 'recommendSearchPhrase';
  description: any;
}) => {
  const configService = new ConfigService();

  let prompt = '';

  switch (type) {
    case 'firstFormGeneratedCoursePrompt':
      prompt = firstFormGeneratedCoursePrompt(description);
      break;
    case 'secondFormGeneratedCoursePrompt':
      prompt = secondFormGeneratedCoursePrompt(description);
      break;
    case 'generateSubSteps':
      prompt = generateSubSteps(description);
      break;
    case 'recommendSearchPhrase':
      prompt = recommendSearchPhrase(description);
      break;
    default:
      prompt = generateDescriptionTitleBasedPrompt(description);
      break;
  }

  const openai = new OpenAI({
    apiKey: configService.get<string>('OPENAI_API_KEY'),
  });

  const completion = await openai.chat.completions
    .create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
    .catch((error) => {
      Logger.error(error);
      return null;
    });

  if (!completion) {
    return null;
  }

  let response = completion.choices[0].message.content;

  if (!response) {
    return null;
  }

  response = response.replace(/^```json\n/, '').replace(/\n```$/, '');

  return response;
};
