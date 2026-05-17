# Rover CLI

![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square) [![npm]](https://www.npmjs.com/package/@rover-labs/cli)

[npm]: https://img.shields.io/npm/v/@rover-labs/cli.svg?style=flat-square

The official CLI for Rover Labs - your AI-powered coding assistant.

## Installation

```bash
# Using npm
npm install -g @rover-labs/cli

# Using pnpm
pnpm add -g @rover-labs/cli

# Using yarn
yarn global add @rover-labs/cli
```

## Commands

### `rover auth`

Authenticate with your Rover account. This will:

1. Open your browser for authentication
2. Generate a secure token
3. Store credentials safely in `~/.rover/config.json` (configurable via `ROVER_SETTINGS_DIR`)
4. Confirm successful connection

```bash
rover auth
```

#### Configuration directory

By default, credentials are stored in `~/.rover/config.json`. You can override the settings directory by setting the `ROVER_SETTINGS_DIR` environment variable:

```bash
# Example: use a custom settings directory
export ROVER_SETTINGS_DIR=~/.config/rover
rover auth
```

### `rover create`

Create a new task in Rover with a message:

```bash
# Create a task in the current repository and branch
rover create "Fix the login bug"

# Specify a different repository
rover create "Add new feature" --repo owner/repo

# Use a specific base branch
rover create "Update documentation" --branch develop

# Use existing branch without creating a new one
rover create "Quick fix" --no-new-branch

# Start in plan mode (no file writes until approval)
rover create "Refactor the auth module" --mode plan

# Choose a specific model
rover create "Investigate flaky tests" --model sonnet
rover create "Run large codegen" --model gpt-5-high
> GPT-5.1 Codex Max variants require a ChatGPT subscription connected in Settings.
```

#### Options

- `-r, --repo <repo>`: GitHub repository (default: current repository)
- `-b, --branch <branch>`: Base branch name (default: current branch, falls back to main)
- `--no-new-branch`: Don't create a new branch (default: creates new branch)
- `-m, --mode <mode>`: Task mode: `plan` or `execute` (default: `execute`)
- `-M, --model <model>`: AI model to use: `opus`, `sonnet`, `haiku`, `amp`, `gpt-5-low`, `gpt-5-medium`, `gpt-5`, `gpt-5-high`, `gpt-5.2-low`, `gpt-5.2-medium`, `gpt-5.2`, `gpt-5.2-high`, `gpt-5.1-low`, `gpt-5.1-medium`, `gpt-5.1`, `gpt-5.1-high`, `gpt-5.1-codex-max-low`, `gpt-5.1-codex-max-medium`, `gpt-5.1-codex-max`, `gpt-5.1-codex-max-high`, `gpt-5.1-codex-max-xhigh`, `gpt-5-codex-low`, `gpt-5-codex-medium`, `gpt-5-codex-high`, `gpt-5.1-codex-low`, `gpt-5.1-codex-medium`, `gpt-5.1-codex-high`, `gemini-3-pro`, `gemini-2.5-pro`, `grok-code`, `qwen3-coder`, `kimi-k2`, `glm-4.6`, `opencode/gemini-2.5-pro` (optional)

### `rover pull`

Pull tasks from Rover to your local machine:

```bash
# Interactive mode - select from recent tasks
rover pull

# Pull a specific task by ID
rover pull <taskId>

# Pull and automatically launch Claude Code
rover pull <taskId> --resume
```

**Getting the task ID**: You can find the task ID at the end of the URL when viewing a task in Rover. For example, in `https://roverlabs.com/tasks/abc123-def456`, the task ID is `abc123-def456`.

#### Options

- `-r, --resume`: Automatically launch Claude Code after pulling

### `rover list`

List all tasks in a non-interactive format:

```bash
# List all tasks (automatically filters by current repo when inside a Git repository)
rover list
```

#### Example Output

```
Task ID         abc123def456
Name            Fix login bug
Branch          rover/fix-login
Repository      myorg/myrepo
PR Number       #123

Task ID         def789ghi012
Name            Add dark mode
Branch          rover/dark-mode
Repository      myorg/myrepo
PR Number       N/A

Total: 2 tasks
```

### `rover mcp`

Run an MCP (Model Context Protocol) server for the git repository:

```bash
# Run MCP server for current directory
rover mcp
```

#### Claude Code Integration

You can add the Rover MCP server to your local Claude Code instance to enable direct interaction with Rover tasks from within Claude:

```bash
claude mcp add rover -- rover mcp
```

This integration provides Claude Code with the following capabilities:

- **`rover_list`**: List all your Rover tasks directly from Claude
- **`rover_create`**: Create new tasks without leaving Claude Code
- **`rover_pull`**: Pull task session data to continue work

The MCP server acts as a bridge between Claude Code and Rover, allowing you to manage tasks using natural language commands within your AI coding sessions.

## Support

- **Documentation**: [https://docs.roverlabs.com](https://docs.roverlabs.com)
- **Website**: [https://roverlabs.com](https://roverlabs.com)
