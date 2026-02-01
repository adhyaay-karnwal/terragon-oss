import { daemonAsStr, mcpServerAsStr } from "@rover/bundled";

export function getDaemonFile() {
  return daemonAsStr;
}

export function getMcpServerFile() {
  return mcpServerAsStr;
}

export const sandboxTimeoutMs = 1000 * 60 * 15; // 15 minutes
export const roverSetupScriptTimeoutMs = 1000 * 60 * 15; // 15 minutes
