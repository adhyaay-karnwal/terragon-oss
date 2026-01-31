import { createDb } from "@rover/shared/db";
import { env } from "@rover/env/apps-www";

export const db = createDb(env.DATABASE_URL);
