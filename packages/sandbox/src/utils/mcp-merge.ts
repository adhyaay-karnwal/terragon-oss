import { McpConfig, McpServer } from "../mcp-config";

export function buildMergedMcpConfig({
  userMcpConfig,
  includeRover,
  roverCommand,
  roverArgs,
}: {
  userMcpConfig: McpConfig | undefined;
  includeRover: boolean;
  roverCommand: string;
  roverArgs: string[];
}): McpConfig {
  const mergedServers: Record<string, McpServer> = {
    ...Object.fromEntries(
      Object.entries(userMcpConfig?.mcpServers ?? {}).filter(
        ([name]) => name !== "rover",
      ),
    ),
  } as Record<string, McpServer>;

  if (includeRover) {
    mergedServers["rover"] = {
      command: roverCommand,
      args: roverArgs,
    } as McpServer;
  }

  return { mcpServers: mergedServers };
}
