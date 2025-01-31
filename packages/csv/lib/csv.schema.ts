import { CSVField } from "./csv.field.js"
import { CSVFieldParseError } from "./errors/csv-field-parse.error.js"
import { CSVSchemaParseError } from "./errors/csv-schema-parse.error.js"
import { InferRow } from "./infer.js"

export class CSVSchema<S extends { [key: string]: CSVField<any, any, any, any, any> }> {
  constructor (private fields: S) { }

  async parse (records: Record<string, string>[]): Promise<InferRow<S>[]> {
    const result: InferRow<S>[] = []
    const errors: CSVFieldParseError[] = []

    for (const [rowIndex, record] of records.entries()) {
      const row: Partial<InferRow<S>> = {}

      for (const column in this.fields) {
        try {
          const field = this.fields[column]

          row[column] = field.parse(record[field.name], rowIndex)
        } catch (error) {
          if (error instanceof CSVFieldParseError) {
            errors.push(error)
          }
        }
      }

      result.push(row as InferRow<S>)
    }

    for (const [rowIndex, row] of result.entries()) {
      for (const column in this.fields) {
        try {
          await this.fields[column].refine(row[column], row, rowIndex, result)
        } catch (error) {
          if (error instanceof CSVFieldParseError) {
            errors.push(error)
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new CSVSchemaParseError(errors)
    }

    return result
  }
}