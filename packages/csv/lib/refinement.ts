export class Refinement {
  constructor (private readonly refine: (
    value,
    row: object,
    rowIndex: number,
    rows: object[]
  ) => boolean | Promise<boolean>) {}

  async check (
    value,
    row: object,
    rowIndex: number,
    rows: object[]
  ): Promise<boolean> {
    return await this.refine(value, row, rowIndex, rows)
  }
}
