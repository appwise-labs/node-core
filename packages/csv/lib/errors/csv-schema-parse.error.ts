import { CSVFieldParseError } from "./csv-field-parse.error.js";

export class CSVSchemaParseError extends Error {
  constructor (readonly errors: CSVFieldParseError[]) {
    super('CSV schema parse error')
  }
}