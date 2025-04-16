import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "debug";

const prefix = (level: LogLevel) => {
  const time = new Date().toISOString();
  switch (level) {
    case "info":
      return chalk.blue(`[INFO ${time}]`);
    case "warn":
      return chalk.yellow(`[WARN ${time}]`);
    case "error":
      return chalk.red(`[ERROR ${time}]`);
    case "debug":
      return chalk.gray(`[DEBUG ${time}]`);
  }
};

export const logger = {
  info: (msg: string) => console.log(`${prefix("info")} ${msg}`),
  warn: (msg: string) => console.warn(`${prefix("warn")} ${msg}`),
  error: (msg: string) => console.error(`${prefix("error")} ${msg}`),
  debug: (msg: string) => console.debug(`${prefix("debug")} ${msg}`)
};
