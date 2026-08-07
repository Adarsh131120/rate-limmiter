// src/utils/logger.js
//
// Minimal structured logger. In a real production system you'd swap this
// for pino/winston shipping to your log aggregator (Datadog, ELK, CloudWatch)
// — but the call sites (`logger.info('event_name', {...})`) wouldn't change,
// which is the point of isolating this behind one module.

import { config } from '../config/index.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[config.logLevel] ?? LEVELS.info;

function log(level, event, fields = {}) {
  if (LEVELS[level] > currentLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export const logger = {
  error: (event, fields) => log('error', event, fields),
  warn: (event, fields) => log('warn', event, fields),
  info: (event, fields) => log('info', event, fields),
  debug: (event, fields) => log('debug', event, fields),
};

export default logger;
