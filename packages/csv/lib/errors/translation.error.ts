export class TranslationError extends Error {
  constructor (value: string) {
    super(`Unknown value: ${value}`)
  }
}
