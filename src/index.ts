#!/usr/bin/env node

import 'dotenv/config';
import { Client, CompletionResponse, HUMAN_PROMPT } from '@anthropic-ai/sdk';
import { PROMPT_TEMPLATE } from './constants.js';
import format from 'string-template';
import inquirer, { ListQuestion } from 'inquirer';

import chalk from 'chalk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('The ANTHROPIC_API_KEY environment variable must be set');
}

const client = new Client(apiKey);

const [, , ...args] = process.argv;

if (args.length === 0) {
  console.log('Please enter a query.');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

const completeSync = async function (
  prompt: string
): Promise<CompletionResponse> {
  try {
    return client.complete({
      prompt,
      stop_sequences: [HUMAN_PROMPT],
      max_tokens_to_sample: 200,
      model: 'claude-v1',
    });
  } catch (error) {
    console.error(error);
  }
  return Promise.reject(new Error('Failed to complete'));
};

function displayResult(query: string, command: string, explanation: string) {
  const headerStyle = chalk.black.bgWhite;
  const lineLength = 100;

  function createCenteredHeader(text: string, lineLength: number) {
    const spacesLength = Math.abs(lineLength - text.length - 2);
    const halfSpaces = '─'.repeat(Math.floor(spacesLength / 2));
    return (
      halfSpaces +
      ' ' +
      text +
      ' ' +
      halfSpaces +
      (spacesLength % 2 === 1 ? '─' : '')
    );
  }

  console.log();
  console.log(createCenteredHeader(headerStyle('Query'), lineLength));
  console.log(`\n${query}\n`);
  console.log(createCenteredHeader(headerStyle('Command'), lineLength));
  console.log(`\n${command}\n`);
  console.log(createCenteredHeader(headerStyle('Explanation'), lineLength));
  console.log(`\n${explanation}\n`);
}

async function showUserChoices() {
  const question: ListQuestion<{ choice: string }> = {
    type: 'list',
    name: 'choice',
    message: 'Choose an option:',
    choices: [
      '✅ This looks right, thank you!',
      '🤔 Actually, I can be more specific. Let me clarify.',
      '❌ Cancel',
    ],
  };

  const answer = await inquirer.prompt(question);
  const choice = answer.choice.split(' ')[0];

  switch (choice) {
    // case '✅':
    //   // TODO: Execute the command (use appropriate method, such as child_process.exec)
    //   break;
    // case '🤔':
    //   const revisedQueryAnswer = await inquirer.prompt([
    //     {
    //       type: 'input',
    //       name: 'revisedQuery',
    //       message: 'Please enter your revised query: ',
    //     },
    //   ]);
    //   // Add the new query to the history array and re-run completeSync
    //   history.push(revisedQueryAnswer.revisedQuery);
    //   completeSync(revisedQueryAnswer.revisedQuery);
    //   break;
    case '❌':
      break;
    default:
      break;
  }
}

const query = args.length === 1 ? args[0] : args.join(' ');
const prompt = format(PROMPT_TEMPLATE, { userInput: query });
const history = [];

completeSync(prompt)
  .then(res => {
    const completionText = JSON.parse(res.completion);
    const { commands, explanation } = completionText;
    displayResult(query, commands, explanation);
    return showUserChoices(); // 3. Add a return statement
  })
  .catch(error => {
    process.stdout.write(error);
  });
