# claude-copilot-cli

[![asciicast](https://asciinema.org/a/fBjlXuDf6qGOdPprbzqNoJHq3.svg)](https://asciinema.org/a/fBjlXuDf6qGOdPprbzqNoJHq3)

## Getting Started

1. Clone the repo:
    ```bash
    git clone https://github.com/marvinyan/claude-cli-copilot.git
    ```
2. Rename the `.env.example` file to `.env` and fill in your Anthropic API key.
3. Build the project:
    ```bash
    npm install  # or pnpm install
    npm run build
    ```
4. Setup alias command:
    ```bash
    npm link
    chmod +x ./lib/index.js
    ```
5. Run the script:
    ```bash
    c3? "list all .js files"
    ```

## Known Issues

1. Sometimes Claude will respond with a string that is a mix of JSON and commentary, causing the script to crash.
2. The script will clear the entire terminal window. Ideally, it should only clear the script's output.
