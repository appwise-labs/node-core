export class CSVMissingColumnError extends Error {
  constructor (public readonly missingColumns: string[]) {
    super('Csv is missing columns: ' + missingColumns.join(', '))
  }
}
