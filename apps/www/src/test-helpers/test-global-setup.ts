import {
  setup as setupShared,
  teardown as teardownShared,
} from "@rover/shared/test-global-setup";
import { execSync } from "child_process";

export async function setup() {
  await setupShared();
  execSync("pnpm turbo --filter @rover/sandbox build");
}

export async function teardown() {
  await teardownShared();
}
