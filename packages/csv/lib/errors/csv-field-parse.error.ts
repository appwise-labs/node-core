export class CSVFieldParseError extends Error {
  constructor (
    public readonly rowIndex: number,
    public readonly column: string,
    public readonly value: string | undefined,
    public readonly code: string,
    public readonly message: string
  ) {
    super('CSV field parse error')
  }
}
