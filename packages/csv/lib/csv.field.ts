import assert from 'assert'
import { CSVFieldParseError } from './errors/csv-field-parse.error.js'
import { InferRow, InferValue } from './infer.js'
import { Translator } from './translator.js'
import { TranslationError } from './errors/translation.error.js'
import { Refinement } from './refinement.js'

export class CSVField<
  T extends 'string' | 'int' | 'boolean' | 'enum' | 'date',
  E extends { [key: string]: E[keyof E] } | undefined = undefined,
  N extends boolean = false,
  R extends boolean = true,
  A extends boolean = false
> {
  readonly name: string
  private readonly type: T
  private readonly enum: E | undefined
  private readonly nullable: N | undefined
  private readonly required: R | undefined
  private readonly isArray: A | undefined
  private readonly translator: Translator | undefined
  private readonly refinement?: Refinement

  constructor (options: {
    name: string
    type: T
    enum?: E
    nullable?: N
    required?: R
    isArray?: A
    translator?: Translator
    refinement?: Refinement
  }) {
    this.name = options.name
    this.type = options.type
    this.enum = options.enum
    this.nullable = options.nullable
    this.required = options.required
    this.isArray = options.isArray
    this.translator = options.translator
    this.refinement = options.refinement
  }

  parse (value: string | undefined, rowIndex: number): InferValue<T, E, N, R, A> {
    if (value === undefined) {
      if (this.required ?? true) {
        throw new CSVFieldParseError(rowIndex, this.name, value, 'required', `${this.name} is required`)
      }

      return undefined as InferValue<T, E, N, R, A>
    }

    if (value === '') {
      if (!(this.nullable ?? false)) {
        throw new CSVFieldParseError(rowIndex, this.name, value, 'not_empty', `${this.name} cannot be empty`)
      }

      return null as InferValue<T, E, N, R, A>
    }


    if (this.isArray ?? false) {
      return value.split(',').map(v => this.parseValue(v, rowIndex)) as InferValue<T, E, N, R, A>
    }

    return this.parseValue(value, rowIndex) as InferValue<T, E, N, R, A>
  }

  async refine (
    value: InferValue<T, E, N, R, A>,
    row: InferRow<{ [key: string]: CSVField<T, E, N, R> }>,
    rowIndex: number,
    rows: InferRow<{ [key: string]: CSVField<T, E, N, R> }>[]
  ): Promise<void> {
    if (this.refinement === undefined) {
      return
    }
    if (!(await this.refinement.check(value, row, rowIndex, rows))) {
      throw new CSVFieldParseError(rowIndex, this.name, value?.toString(), 'refinement', `${this.name} is invalid`)
    }
  }

  private translate (value: string, rowIndex: number): string {
    if (this.translator === undefined) {
      return value
    }

    try {
      return this.translator.translate(value)
    } catch (e) {
      if (e instanceof TranslationError) {
        throw new CSVFieldParseError(rowIndex, this.name, value, 'translator', `${this.name} cannot be translated: ${e.message}`)
      }
      throw e
    }
  }

  private parseValue (value: string, rowIndex: number): string | number | boolean | E[keyof E] {
    value = value.trim()
    value = this.translate(value, rowIndex)

    switch (this.type) {
      case 'string':
        return this.parseString(value, rowIndex)
      case 'int':
        return this.parseInt(value, rowIndex)
      case 'boolean':
        return this.parseBoolean(value, rowIndex)
      case 'enum':
        return this.parseEnum(value, rowIndex)
      case 'date':
        return this.parseDate(value, rowIndex)
    }

    throw new Error('Invalid field type')
  }

  private parseString (value: string, rowIndex: number): string {
    assert (this.type === 'string')

    return value
  }

  private parseInt (value: string, rowIndex: number): number {
    assert (this.type === 'int')

    const parsed = parseInt(value)

    if (isNaN(parsed)) {
      throw new CSVFieldParseError(rowIndex, this.name, value, 'invalid_int', `${this.name} must be an integer value`)
    }

    return parsed
  }

  private parseBoolean (value: string, rowIndex: number): boolean {
    assert (this.type === 'boolean')

    if (value === '1' || value.toLowerCase() === 'true') {
      return true
    }

    if (value === '0' || value.toLowerCase() === 'false') {
      return false
    }

    throw new CSVFieldParseError(rowIndex, this.name, value, 'invalid_boolean', `${this.name} must be a boolean value`)
  }

  private parseEnum (value: string, rowIndex: number): E[keyof E] {
    assert (this.type === 'enum')
    assert (this.enum !== undefined)

    const enumValues = Object.values(this.enum)
    const i = enumValues.indexOf(value as E[keyof E])

    if (i === -1) {
      throw new CSVFieldParseError(rowIndex, this.name, value, 'invalid_enum', `${this.name} must be a enum value: ${Object.values(this.enum).join(', ')}`)
    }

    return enumValues[i]
  }

  private parseDate (value: string, rowIndex: number): string {
    assert (this.type === 'date')

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const isValidDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) && (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );

    if (!isValidDate) {
      throw new CSVFieldParseError(rowIndex, this.name, value, 'invalid_date', `${this.name} must be a date value of format YYYY-MM-DD`)
    }

    return value
  }
}
