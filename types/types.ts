export type CustomAwaited<T> = T extends Promise<infer U> ? U : T

export enum Commands {
  START = '/start',
  INFO = '/info',
  RANDOM_STICKER = '/random_sticker',
  GAME = '/game',
  AGAIN = '/again',
}
