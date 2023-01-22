export type LogFunc = (msg: any, ...opts: any[]) => void;

export class Logger {
  static #instance: Logger;
  protected readonly debug!: LogFunc;
  protected readonly error!: LogFunc;
  protected readonly log!: LogFunc;
  protected readonly warn!: LogFunc;

  readonly log_prefix: string;

  constructor(log_prefix: string) {
    this.log_prefix = log_prefix;
    if (Logger.#instance) {
      return Logger.#instance;
    }

    this.debug = this.#log_func_factory(console.debug);
    this.error = this.#log_func_factory(console.error);
    this.log = this.#log_func_factory(console.log);
    this.warn = this.#log_func_factory(console.warn);

    Logger.#instance = this;
  }

  #log_func_factory(console_func: LogFunc): LogFunc {
    return (msg: any, ...opts: any[]) =>
      console_func.apply(console, [`[${this.log_prefix}] ${msg}`, ...opts]);
  }
}
