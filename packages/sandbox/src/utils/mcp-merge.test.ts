import { describe, it, expect } from "vitest";
import { buildMergedMcpConfig } from "./mcp-merge";
import type { McpConfig } from "../mcp-config";

describe("buildMergedMcpConfig", () => {
  const userCfg: McpConfig = {
    mcpServers: {
      alpha: { command: "npx", args: ["-y", "alpha"] },
      rover: { command: "node", args: ["/some/other/path.mjs"] },
      httpy: {
        type: "http",
        url: "https://api.example.com",
        headers: { A: "B" },
      },
    },
  };

  it("filters user-provided rover and injects built-in when includeRover=true", () => {
    const merged = buildMergedMcpConfig({
      userMcpConfig: userCfg,
      includeRover: true,
      roverCommand: "node",
      roverArgs: ["/tmp/rover-mcp-server.mjs"],
    });

    // Keeps non-rover entries
    expect(Object.keys(merged.mcpServers)).toEqual(
      expect.arrayContaining(["alpha", "httpy", "rover"]),
    );

    // User rover is not carried through; replaced with built-in
    expect(merged.mcpServers.rover).toEqual({
      command: "node",
      args: ["/tmp/rover-mcp-server.mjs"],
    });

    // Other entries preserved verbatim
    expect(merged.mcpServers.alpha).toEqual({
      command: "npx",
      args: ["-y", "alpha"],
    });
    expect(merged.mcpServers.httpy).toEqual({
      type: "http",
      url: "https://api.example.com",
      headers: { A: "B" },
    });
  });

  it("omits rover entirely when includeRover=false", () => {
    const merged = buildMergedMcpConfig({
      userMcpConfig: userCfg,
      includeRover: false,
      roverCommand: "node",
      roverArgs: ["/tmp/rover-mcp-server.mjs"],
    });

    expect(merged.mcpServers.rover).toBeUndefined();
    expect(merged.mcpServers.alpha).toBeDefined();
    expect(merged.mcpServers.httpy).toBeDefined();
  });

  it("handles undefined user config", () => {
    const merged = buildMergedMcpConfig({
      userMcpConfig: undefined,
      includeRover: true,
      roverCommand: "node",
      roverArgs: ["/tmp/rover-mcp-server.mjs"],
    });
    expect(merged.mcpServers).toEqual({
      rover: { command: "node", args: ["/tmp/rover-mcp-server.mjs"] },
    });
  });
});
