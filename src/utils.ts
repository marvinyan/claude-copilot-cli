// @ts-nocheck
/* eslint-disable */
import { CompletionResponse } from '@anthropic-ai/sdk';
import extract from 'extract-json-from-string';

export const formatNumberedList = (contents: string[]): string => {
  return contents
    .reduce((acc, curr, index) => {
      return `${acc}${index + 1}. ${curr}\n`;
    }, '')
    .trimEnd();
};

// TODO: Clean up
export async function getExtractedCompletion(
  prompt: string,
  completeSync: (prompt: string) => Promise<CompletionResponse>
): Promise<any> {
  let completionResponse: CompletionResponse | undefined;

  try {
    completionResponse = await completeSync(prompt);
    return JSON.parse(completionResponse.completion);
  } catch (error) {
    if (completionResponse?.completion === undefined) {
      console.log('Did not get a completion response from the API');
      throw error;
    }
    // Fallback to extracting the first JSON object from the completion if any
    const extractedCompletion = extract(completionResponse.completion);
    if (extractedCompletion.length > 0) {
      console.log("Extracted completion from API's response");
      console.log(extractedCompletion[0]);
      return extractedCompletion[0];
    }

    console.log("Unable to extract completion from API's response");
    console.log(completionResponse.completion);
    throw error;
  }
}

// export const completeStream = async function (
//   prompt: string
// ): Promise<CompletionResponse> {
//   let numLines = 0;
//
//   try {
//     return client.completeStream(
//       {
//         prompt,
//         stop_sequences: [HUMAN_PROMPT],
//         max_tokens_to_sample: 200,
//         model: 'claude-v1',
//       },
//       {
//         onOpen: response => {
//           console.log('Opened stream, HTTP status code', response.status);
//         },
//         onUpdate: completion => {
//           numLines = (completion.completion.match(/\n/g) || '').length;
//           readline.moveCursor(process.stdout, 0, -numLines);
//           readline.clearScreenDown(process.stdout);
//           process.stdout.write(completion.completion);
//         },
//       }
//     );
//   } catch (error) {
//     console.error(error);
//   }
//   return Promise.reject(new Error('Failed to complete stream'));
// };
