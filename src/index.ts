#!/usr/bin/env node

import 'dotenv/config';
import { Client, CompletionResponse, HUMAN_PROMPT } from '@anthropic-ai/sdk';
import format from 'string-template';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import util from 'util';
import chalk from 'chalk';
import readline from 'readline';

import { formatNumberedList, getExtractedCompletion } from './utils.js';
import {
  PROMPT_TEMPLATE_COMMAND_ONLY,
  PROMPT_TEMPLATE_EXPLANATION_ONLY,
  RESULT_EVALUATION_CHOICES,
} from './constants.js';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('The ANTHROPIC_API_KEY environment variable must be set');
}

const client = new Client(apiKey);
const execPromisified = util.promisify(exec);

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
      max_tokens_to_sample: 2000,
      model: 'claude-v1',
    });
  } catch (error) {
    console.error(error);
  }
  return Promise.reject(new Error('Failed to complete'));
};

function displayResult(query: string, commands: string[], explanation: string) {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  const headerStyle = chalk.black.bgWhite;
  const lineLength = 100;

  function createCenteredHeader(text: string, lineLength: number) {
    const spacesLength = Math.abs(lineLength - text.length - 2);
    const halfSpaces = '─'.repeat(Math.floor(spacesLength / 2));
    return `${halfSpaces} ${text} ${halfSpaces}${
      spacesLength % 2 === 1 ? '─' : ''
    }`;
  }

  console.log();
  console.log(createCenteredHeader(headerStyle('Query'), lineLength));
  console.log(`\n${query}\n`);
  console.log(createCenteredHeader(headerStyle('Command'), lineLength));
  console.log(`\n${commands.join('\n')}\n`);
  console.log(createCenteredHeader(headerStyle('Explanation'), lineLength));
  console.log(`\n${explanation}\n`);
}

async function showUserChoices(
  history: string[],
  commands: string[]
): Promise<void> {
  const answer = await inquirer.prompt(RESULT_EVALUATION_CHOICES);
  const choice = answer.choice.split(' ')[0];

  switch (choice) {
    case '✅': {
      // Show confirmation message
      console.log('This will execute the suggested commands in your shell.');

      // Confirm execution of the commands
      const confirmAnswer: { executeDecision: string } = await inquirer.prompt([
        {
          type: 'input',
          name: 'executeDecision',
          message: 'Are you sure? (y/n)',
        },
      ]);

      if (confirmAnswer.executeDecision.toLowerCase() === 'y') {
        for (const cmd of commands) {
          try {
            const { stdout, stderr } = await execPromisified(cmd);
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
          } catch (error: unknown) {
            if (error instanceof Error) {
              console.error(`Error executing command: ${error.message}`);
            } else {
              console.error('Error executing command: ', error);
            }
          }
        }
      } else {
        console.log('Not executing the commands.');
        return showUserChoices(history, commands);
      }
      break;
    }
    case '🤔': {
      const revisedQueryAnswer: { revision: string } = await inquirer.prompt([
        {
          type: 'input',
          name: 'revision',
          message: 'Enter your revision: ',
        },
      ]);
      // Add the new query to the history array and re-run completeSync
      history.push(revisedQueryAnswer.revision);
      await runCliHelp(history);
      break;
    }
    default:
      break;
  }
}

async function runCliHelp(userInputs: string[]) {
  // joinedUserInputs is a string consisting of a numbered list of the user inputs
  const joinedUserInputs = formatNumberedList(userInputs);

  const promptForCommands = format(PROMPT_TEMPLATE_COMMAND_ONLY, {
    userInputs: joinedUserInputs,
  });

  try {
    const extractedCommandJson: {
      commands: string[];
    } = await getExtractedCompletion(promptForCommands, completeSync);
    const promptForExplanation = format(PROMPT_TEMPLATE_EXPLANATION_ONLY, {
      terminalCommands: formatNumberedList(extractedCommandJson.commands),
    });
    const explanationCompletionJson: {
      explanation: string;
    } = await getExtractedCompletion(promptForExplanation, completeSync);

    const { commands } = extractedCommandJson;
    const { explanation } = explanationCompletionJson;

    displayResult(joinedUserInputs, commands, explanation);
    await showUserChoices(userInputs, commands);
  } catch (error) {
    console.error(error);
  }
}

const query = args.length === 1 ? args[0] : args.join(' ');
void runCliHelp([query]);
