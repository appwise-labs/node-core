import { TranslationError } from "./errors/translation.error.js"

export class Translator {
  private map: Map<string, string>

  constructor (dict: { [key: string]: string }) {
    this.map = new Map(Object.entries(dict)
      .map(([key, value]) => [this.cleanValue(key), value]))
  }

  translate (value: string): string
  translate (value: string | null): string | null
  translate (value: string | undefined): string | undefined
  translate (value: string | null | undefined): string | null | undefined
  translate (value: string | null | undefined): string | null | undefined {
    if (value === undefined) return undefined
    if (value === null) return null

    const result = this.map.get(this.cleanValue(value))

    if (result === undefined) {
      throw new TranslationError(value)
    }

    return result
  }

  private cleanValue (value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  }
}