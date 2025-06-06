import { TEST } from './config';
import { ApplicationError } from '../common/errors/application-error';

import type i18n from 'i18n';
if (!('i18n' in globalThis)) {
  globalThis.i18n = {
    configure: () => undefined,
    init: () => undefined,
    __: (...args: unknown[]) => (typeof args[0] === 'string' ? args[0] : ''),
    __n: () => '',
    __mf: () => '',
    setLocale: () => undefined,
    getLocale: () => 'pt',
    getCatalog: () => ({}),
    getLocales: () => ['pt', 'en'],
    addLocale: () => undefined,
    removeLocale: () => undefined,
    getTranslations: () => ({}),
    reloadLocales: () => undefined,
  } as unknown as typeof i18n;
}

const colours = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};

export function getCallingFunction(error: Error): string {
  try {
    const stack = error.stack;

    if (stack === undefined) return '--';

    const line = stack.split('\n')[2];
    if (line === undefined) return '--';
    const regex = /^.*at\s([a-zA-Z]+).*$/;
    const groups = line.match(regex);

    if (groups === null) return '--';

    if (groups.length < 2) return '--';

    return groups[1] ?? '--';
  } catch {
    return '--';
  }
}

export function log(message?: unknown, ...optionalParams: unknown[]) {
  if (!TEST)
    console.log(
      `[${new Date().toLocaleString()}]`,
      colours.fg.magenta,
      '[SERVER-LOG] ',
      colours.reset,
      message,
      ...optionalParams
    );
}

export function info(message?: unknown, ...optionalParams: unknown[]) {
  if (!TEST)
    console.info(
      `[${new Date().toLocaleString()}]`,
      colours.fg.cyan,
      '[INFO]',
      colours.reset,
      colours.bg.green,
      `[${getCallingFunction(new Error())}]`,
      colours.reset,
      message,
      ...optionalParams
    );
}

export function warn(message?: unknown, ...optionalParams: unknown[]) {
  if (!TEST)
    console.warn(
      `[${new Date().toLocaleString()}]`,
      colours.fg.yellow,
      '[WARN]',
      colours.reset,
      colours.bg.green,
      `[${getCallingFunction(new Error())}]`,
      colours.reset,
      message,
      ...optionalParams
    );
}

export function error(message?: unknown, ...optionalParams: unknown[]) {
  if (
    message instanceof Error &&
    'translationKey' in message &&
    typeof (globalThis.i18n as { __?: unknown })?.__ === 'function' &&
    (message as ApplicationError).translationKey
  ) {
    const translationKey = (message as ApplicationError)
      .translationKey as string;
    const translationParams =
      (message as ApplicationError).translationParams || {};
    const translated = (
      globalThis.i18n as {
        __: (key: string, params?: Record<string, unknown>) => string;
      }
    ).__(translationKey, translationParams);
    if (!TEST) {
      console.error(
        `[${new Date().toLocaleString()}]`,
        colours.fg.red,
        '[ERROR]',
        colours.reset,
        colours.bg.green,
        `[${getCallingFunction(new Error())}]`,
        colours.reset,
        translated,
        ...optionalParams
      );
      if (process.env.NODE_ENV !== 'production') {
        console.error(message);
      }
    }
    return;
  }
  if (!TEST)
    console.error(
      `[${new Date().toLocaleString()}]`,
      colours.fg.red,
      '[ERROR]',
      colours.reset,
      colours.bg.green,
      `[${getCallingFunction(new Error())}]`,
      colours.reset,
      message,
      ...optionalParams
    );
}

const logging = {
  log,
  info,
  warn,
  error,
  warning: warn,
  getCallingFunction,
};
declare global {
  var logging: {
    log: (message?: unknown, ...optionalParams: unknown[]) => void;
    info: (message?: unknown, ...optionalParams: unknown[]) => void;
    warn: (message?: unknown, ...optionalParams: unknown[]) => void;
    warning: (message?: unknown, ...optionalParams: unknown[]) => void;
    error: (message?: unknown, ...optionalParams: unknown[]) => void;
    getCallingFunction: (error: Error) => string;
  };
}

globalThis.logging = logging;

export default logging;
