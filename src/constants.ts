import { AI_PROMPT, HUMAN_PROMPT } from '@anthropic-ai/sdk';
import { ListQuestion } from 'inquirer';

const SAMPLE_RESPONSE_COMMAND_ONLY = {
  commands: ['git add . && git commit -m "Initial commit"'],
};

const SAMPLE_RESPONSE_EXPLANATION_ONLY = {
  explanation:
    '* `git add` is used to add files to the staging area.\n  - The `.` means to add all files in the current directory.\n\
`* git commit` is used to commit the staged files.\n  - The `-m` flag is used to specify a commit message.',
};

export const PROMPT_TEMPLATE_COMMAND_ONLY = `${HUMAN_PROMPT} Provide the terminal command(s) that would satisfy\
 the requirements below. Combine these requests into as few commands as possible:
\`\`\`
{userInputs}
\`\`\`

When replying, follow these guidelines:
 
- Return only a valid JSON string as your answer. Do not include any other text before or after the JSON string.
- The JSON string must contain a \`commands\` field.

A sample response is shown below to help you understand the expected format:

\`\`\`
${JSON.stringify(SAMPLE_RESPONSE_COMMAND_ONLY, null, 2)}
\`\`\`${AI_PROMPT}`;

export const PROMPT_TEMPLATE_EXPLANATION_ONLY = `${HUMAN_PROMPT} Explain what the sequence of terminal commands below does:
\`\`\`
{terminalCommands}
\`\`\`

When replying, follow these guidelines:

- Return only a valid JSON string as your answer. Do not include any other text before or after the JSON string.
- The JSON string must contain an \`explanation\` field that explains what each command does.
- If a command has flags or options, include them in your explanation as sub-bullets.

A sample response is shown below to help you understand the expected format:

\`\`\`
${JSON.stringify(SAMPLE_RESPONSE_EXPLANATION_ONLY, null, 2)}
\`\`\`${AI_PROMPT}`;

export const RESULT_EVALUATION_CHOICES: ListQuestion<{ choice: string }> = {
  type: 'list',
  name: 'choice',
  message: 'Choose an option:',
  choices: [
    '✅ This looks right, thank you!',
    '🤔 Actually, I can be more specific. Let me clarify.',
    '❌ Cancel',
  ],
};
