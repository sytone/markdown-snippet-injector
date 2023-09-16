/* eslint-disable no-mixed-spaces-and-tabs */
import * as process from 'node:process';

/** A shorthand for functions wrapping console.log. */
export type LoggingFunction = typeof console.log;

/** Log levels in ascending order of verbosity. */
export enum Level {
  none,
  error,
  warning,
  info,
  verbose,
  debug,
}

/**
 * The type of log levels, but excluding the 'none' option, as it can be used as
 * a level setting for a logger, but never called for logging.
 */
export type CallableLevel = Exclude<Level, Level.none>;

/** Type of log level names. */
export type LevelName = keyof typeof Level;

/** Escape codes for pretty printing. */
export const printCodes = {
  reset: '\u001B[0m',

  /** Should act as bold in modern terminals */
  bright: '\u001B[1m',

  dim: '\u001B[2m',
  underscore: '\u001B[4m',
  blink: '\u001B[5m',
  reverse: '\u001B[7m',
  hidden: '\u001B[8m',
  black: '\u001B[30m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
  white: '\u001B[37m',
} as const;

/** The codes we use per level in the presets */
export const printCodePresets = {
  [Level.error]: printCodes.red + printCodes.bright,
  [Level.warning]: printCodes.yellow,
  [Level.info]: '',
  [Level.verbose]: printCodes.blue,
  [Level.debug]: printCodes.green,
} as const;

/** Emojis for pretty printing. */
export const emoji = {
  [Level.error]: '🚫',
  [Level.warning]: '⚠️',
  [Level.info]: 'ℹ️',
  [Level.verbose]: '🗣️',
  [Level.debug]: '🐛',
} as const;

/** Collection of log level names, useful for passing around and iteration. */
export const levelNames = ['none', 'error', 'warning', 'info', 'verbose', 'debug'] as const;

/**
 * Collection of log level names sans `none`, useful for passing around and
 * iteration.
 */
export const callableLevelNames = ['error', 'warning', 'info', 'verbose', 'debug'] as const;

/**
 * These are types identifiable as not quite objects at runtime. This typing
 * serves the purpose of aiding us in telling whether a value is a
 * CallableLevelRecord, which makes some programming interfaces simpler to use
 * as we can auto-expand non-CallableLevelRecord values.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type NonObject = boolean | string | number | undefined | Function | any[];

/** A record with `CallableLevel`s as keys */
type CallableLevelRecord<T> = Record<CallableLevel, T>;

/** A `T` or a record with `CallableLevel`s as keys and T as values. */
type CallableLevelRecordable<T> = T | CallableLevelRecord<T>;

/** Determine wether a CallableLevelRecordable is a CallableLevelRecord. */
function isCallableLevelRecord<T>(
  value: CallableLevelRecordable<T>,
): value is CallableLevelRecord<T> {
  // Check for value being a proper object
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  // Value is definitely a regular object
  const keys = Object.keys(value);
  const expectedKeys = [
    Level.error.toString(),
    Level.warning.toString(),
    Level.info.toString(),
    Level.verbose.toString(),
    Level.debug.toString(),
  ] as const;

  return (
    keys.length === callableLevelNames.length
    && keys.sort().every((key, index) => key === expectedKeys[index])
  );
}

/**
 * Expand a value to each value of a CallableLevelRecord, or pass through a
 * CallableLevelRecord.
 */
function expandToCallableLevelRecord<T extends NonObject>(
  value: CallableLevelRecordable<T>,
): CallableLevelRecord<T> {
  return isCallableLevelRecord(value)
    ? value
    : {
      [Level.error]: value,
      [Level.warning]: value,
      [Level.info]: value,
      [Level.verbose]: value,
      [Level.debug]: value,
    };
}

/**
 * Take a level value or its name, and return the corresponding level value.
 * Throws on invalid values.
 */
function resolveLevel(value: Level | LevelName): Level {
  if (typeof value === 'number') {
    // Make sure passed level is valid even at runtime (untyped usage)
    if (Level[value] === undefined) {
      throw new Error(`Invalid logging level ${value}`);
    }

    return value;
  }

  if (typeof value === 'string') {
    const targetLevel = Level[value];
    // Make sure a valid level was passed by name (untyped usage)
    if (targetLevel === undefined) {
      throw new Error(`Invalid logging level '${value}.`);
    }

    return targetLevel;
  }

  // Entirely invalid call (untyped usage)
  throw new Error(`Cannot set logging level to value of type '${typeof value}'.`);
}

/** An object that has the same logging functions as console */
type Loggable = {
  error: LoggingFunction;
  warn: LoggingFunction;
  log: LoggingFunction;
  info: LoggingFunction;
  debug: LoggingFunction;
};

/** A wrapper function to wrap a log message with level and timestamp */
export type Wrapper = (data: any[], level: CallableLevel, timestamp: Date) => any[];

/**
 * `presets` is used to generate defaults but can also be called to customise
 * them slightly
 */
export const presets = {
  /** Pick out the logging functions from a console-like object into a CallableLevelRecord */
  getLoggingFunctions: (i: Loggable = console): CallableLevelRecord<LoggingFunction> => ({
    [Level.error]: i.error,
    [Level.warning]: i.warn,
    [Level.info]: i.log,
    [Level.verbose]: i.info,
    [Level.debug]: i.debug,
  }),

  makeSimpleWrapper:
    (
    	tags: Array<{toString: () => string}> = [],
    	dateFmt: (date: Date) => string = date => date.toISOString(),
    ): Wrapper =>
    	(data, level, timestamp) =>
    		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
    		['[', [...tags, dateFmt(timestamp), Level[level].toUpperCase()].join(' | '), ']', ...data],

  makeFancyWrapper:
    (dateFmt: (date: Date) => string = date => date.toLocaleTimeString()): Wrapper =>
    	(data, level, timestamp) =>
    		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
    		[dateFmt(timestamp), '|', emoji[level] + printCodePresets[level], ...data, printCodes.reset],
} as const;

/**
 * ImmutableLoggers are the basis for regular Loggers. ImmutableLoggers expose
 * only logging functions.
 */
export class ImmutableLogger {
  readonly error: LoggingFunction;
  readonly warning: LoggingFunction;
  readonly info: LoggingFunction;
  readonly verbose: LoggingFunction;
  readonly debug: LoggingFunction;

  protected level: Level;
  protected loggingFunctions: CallableLevelRecord<LoggingFunction>;
  protected wrappers: CallableLevelRecord<Wrapper>;

  constructor(
    level: Level = Level.info,
    loggingFunctions: CallableLevelRecordable<LoggingFunction> = presets.getLoggingFunctions(),
    wrappers: CallableLevelRecordable<Wrapper> = presets.makeSimpleWrapper(),
  ) {
    this.level = resolveLevel(level);
    this.loggingFunctions = expandToCallableLevelRecord(loggingFunctions);
    this.wrappers = expandToCallableLevelRecord(wrappers);

    this.error = this.makeLoggingFunction(Level.error);
    this.warning = this.makeLoggingFunction(Level.warning);
    this.info = this.makeLoggingFunction(Level.info);
    this.verbose = this.makeLoggingFunction(Level.verbose);
    this.debug = this.makeLoggingFunction(Level.debug);
  }

  protected makeLoggingFunction(level: CallableLevel): LoggingFunction {
    return (...data: any[]) => {
      const logger = this.loggingFunctions[level];
      const wrapper = this.wrappers[level];

      if (this.level >= level) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        logger(...wrapper(data, level, new Date()));
      }
    };
  }
}

/**
 * Loggers expose logging functions, in addition to functions to change
 * settings. This mutable nature makes them easier to use globally. The default
 * export of the module is a pre-instantiated Logger.
 */
export class Logger extends ImmutableLogger {
  constructor(
    level = Level.info,
    loggingFunctions = presets.getLoggingFunctions(),
    wrappers = presets.makeFancyWrapper(),
  ) {
    super(level, loggingFunctions, wrappers);
  }

  setLevel(value: Level | LevelName): void {
    this.level = resolveLevel(value);
  }

  setLoggingFunctions(value: CallableLevelRecordable<LoggingFunction>): void {
    this.loggingFunctions = expandToCallableLevelRecord(value);
  }

  setWrappers(value: CallableLevelRecordable<Wrapper>): void {
    this.wrappers = expandToCallableLevelRecord(value);
  }
}

export const log = new Logger(
  Level.info,
  presets.getLoggingFunctions(),
  process.stdout.isTTY ? presets.makeFancyWrapper() : presets.makeSimpleWrapper(),
);

export default log;
