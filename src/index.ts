#!/usr/bin/env node

// The tool should be run by entering a command formatted like this: c3? "How do I make a git commit?"
// This is a command line tool that helps users find and use the right git commands.
// When the tool is run, the user's question is sent to an API endpoint. The endpoint streams response as server-sent events.

// Here are the features the tool should have:
// - Installs as an npm package.
// - Display the response in the terminal as the SSE data comes in.
// - The tool is run by entering a command formatted like this: c3? "How do I make a git commit?"

import 'dotenv/config';
import {
  AI_PROMPT,
  Client,
  CompletionResponse,
  HUMAN_PROMPT,
} from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('The ANTHROPIC_API_KEY environment variable must be set');
}

const client = new Client(apiKey);

const [, , ...args] = process.argv;
console.log('args', args);

if (args.length !== 1) {
  // If the user enters `c3?` without a prompt, the tool should display a message that says "Please enter a prompt."
  console.log('Please enter a prompt.');
  throw new Error('Please enter a prompt.');
}

const query = args[0];

export const streamResponse = async function (): Promise<CompletionResponse> {
  try {
    return client.completeStream(
      {
        prompt: `${HUMAN_PROMPT}${query}${AI_PROMPT}`,
        stop_sequences: [HUMAN_PROMPT],
        max_tokens_to_sample: 100,
        model: 'claude-v1',
      },
      {
        onOpen: response => {
          console.log('Opened stream, HTTP status code', response.status);
        },
        onUpdate: completion => {
          console.log(completion.completion);
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
  return Promise.reject(new Error('Failed to complete stream'));
};
