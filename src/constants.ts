import { AI_PROMPT, HUMAN_PROMPT } from '@anthropic-ai/sdk';

const SAMPLE_RESPONSE = {
  commands: ['git add .', 'git commit -m "My message"'],
  explanation:
    '1. `git add` is used to add files to the staging area.\n- The `.` means to add all files in the current directory.\n\
2. `git commit` is used to commit the staged files.\n- The `-m` flag is used to specify a commit message.',
};

export const PROMPT_TEMPLATE = `${HUMAN_PROMPT} Provide the terminal command(s) that would satisfy\
 this request: "{userInput}". When replying, follow these guidelines:
 
- Your response must solely be a valid JSON string with no other commentary.
- The JSON string must contain a \`commands\` field and an \`explanation\` field.
- If a command contains flags or options, include them in your explanation as sub-bullets.

A sample response is shown below to help you understand the expected format:

\`\`\`
${JSON.stringify(SAMPLE_RESPONSE, null, 2)}
\`\`\`${AI_PROMPT}`;
