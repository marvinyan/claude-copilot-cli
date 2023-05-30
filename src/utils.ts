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
