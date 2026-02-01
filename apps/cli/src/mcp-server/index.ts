import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get the path to the rover CLI executable
function getRoverPath(): string {
  // Check if rover is available in PATH
  try {
    const result = spawnSync("which", ["rover"], {
      encoding: "utf-8",
      stdio: "pipe",
    });
    if (result.status === 0) {
      return "rover";
    }
  } catch {
    // Ignore error and fall through
  }

  // Fall back to node execution of the CLI
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const cliPath = join(__dirname, "../index.js");
  if (existsSync(cliPath)) {
    return cliPath;
  }
  throw new Error("Rover CLI not found");
}

// Execute rover command and return output safely
async function executeRoverCommand(
  command: string,
  args: string[] = [],
): Promise<string> {
  const roverPath = getRoverPath();

  // Build command array safely without shell interpolation
  const commandArgs = [command, ...args];

  const spawnOptions: any = {
    encoding: "utf-8",
    env: {
      ...process.env,
      // Ensure the CLI runs in non-interactive mode
      CI: "true",
    },
  };

  // Use node to execute the CLI if we're using the fallback path
  let executable: string;
  let execArgs: string[];

  if (roverPath === "rover") {
    executable = "rover";
    execArgs = commandArgs;
  } else {
    executable = "node";
    execArgs = [roverPath, ...commandArgs];
  }

  const result = spawnSync(executable, execArgs, spawnOptions);

  if (result.error) {
    throw new Error(
      `Failed to execute rover ${command}: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    // Properly handle error cases
    const stderr = result.stderr?.toString().trim() || "";
    const stdout = result.stdout?.toString().trim() || "";
    const errorMessage =
      stderr || stdout || `Command failed with exit code ${result.status}`;
    throw new Error(`rover ${command} failed: ${errorMessage}`);
  }

  return result.stdout?.toString().trim() || "";
}

// Start MCP server
export async function startMCPServer(): Promise<void> {
  // MCP Server
  const server = new Server(
    {
      name: "rover-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "rover_list",
          description: "List all tasks in Rover (calls 'rover list')",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "rover_create",
          description: "Create a new task in Rover (calls 'rover create')",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The task message/description",
              },
              repo: {
                type: "string",
                description:
                  "GitHub repository (optional, uses current repo if not specified)",
              },
              branch: {
                type: "string",
                description:
                  "Base branch name (optional, uses current branch if not specified)",
              },
              createNewBranch: {
                type: "boolean",
                description: "Whether to create a new branch (default: true)",
                default: true,
              },
            },
            required: ["message"],
          },
        },
        {
          name: "rover_pull",
          description:
            "Pull/fetch session data for a task (calls 'rover pull')",
          inputSchema: {
            type: "object",
            properties: {
              threadId: {
                type: "string",
                description:
                  "The thread/task ID to pull (optional, shows interactive selection if not provided)",
              },
            },
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "rover_list":
          const listOutput = await executeRoverCommand("list");
          return {
            content: [
              {
                type: "text",
                text: listOutput || "No tasks found",
              },
            ],
          };

        case "rover_create":
          const createParams = args as {
            message?: string;
            repo?: string;
            branch?: string;
            createNewBranch?: boolean;
          };

          if (!createParams.message) {
            throw new Error("Message is required for creating a task");
          }

          // Build args array safely without shell interpolation
          const createArgs: string[] = [createParams.message];

          if (createParams.repo) {
            createArgs.push("-r", createParams.repo);
          }

          if (createParams.branch) {
            createArgs.push("-b", createParams.branch);
          }

          if (createParams.createNewBranch === false) {
            createArgs.push("--no-new-branch");
          }

          const createOutput = await executeRoverCommand("create", createArgs);
          return {
            content: [
              {
                type: "text",
                text: createOutput || "Task created successfully",
              },
            ],
          };

        case "rover_pull":
          const pullParams = args as { threadId?: string };
          const pullArgs: string[] = [];

          if (pullParams.threadId) {
            pullArgs.push(pullParams.threadId);
          }

          const pullOutput = await executeRoverCommand("pull", pullArgs);
          return {
            content: [
              {
                type: "text",
                text: pullOutput || "Pull completed successfully",
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
