const CRON_SECRET = process.env.CRON_SECRET || "123456";
const BASE_URL = process.env.APP_URL || "http://localhost:3000";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callCron(path) {
  const url = `${BASE_URL}${path}`;
  console.log(`[cron] Triggering ${path}`);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "User-Agent": "cron-worker",
      },
    });
    const text = await res.text();
    console.log(`[cron] ${path} -> ${res.status}: ${text.slice(0, 200)}`);
  } catch (err) {
    console.error(`[cron] ${path} failed:`, err.message);
  }
}

const JOBS = [
  {
    path: "/api/internal/cron/stalled-tasks",
    intervalMs: 60 * 60 * 1000,
    desc: "every hour",
  },
  {
    path: "/api/internal/cron/scheduled-tasks",
    intervalMs: 60 * 1000,
    desc: "every 1 min",
  },
  {
    path: "/api/internal/cron/queued-tasks",
    intervalMs: 10 * 60 * 1000,
    desc: "every 10 min",
  },
  {
    path: "/api/internal/cron/automations",
    intervalMs: 30 * 60 * 1000,
    desc: "every 30 min",
  },
];

function scheduleJob(job) {
  const run = () => callCron(job.path);
  run();
  setInterval(run, job.intervalMs);
  console.log(`[cron] Scheduled ${job.path} (${job.desc})`);
}

console.log("[cron] Worker started");
JOBS.forEach(scheduleJob);

process.on("SIGTERM", () => {
  console.log("[cron] Shutting down");
  process.exit(0);
});
