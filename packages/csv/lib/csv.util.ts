import { CSVMissingColumnError } from "./errors/csv-missing-column.error.js"

export class CSV {
  static decode <K extends string> (
    csv: string,
    options?: {
      columns?: readonly K[]
      delimiter?: string
    }
  ): Array<Record<K, string>> {
    const delimiter = options?.delimiter ?? ';'

    const [keys, ...data] = csv
      .replace(/(\\r)/gm, '')
      .replace(/(\r)/gm, '')
      .replace(/(\\n)/gm, '\n')
      .replace(/(\n)/gm, '\n')
      .trim()
      .split('\n')
      .map(item => item.split(delimiter))

    const missingColumns = options?.columns?.filter(column => !keys.includes(column)) ?? []

    if (missingColumns.length > 0) {
      throw new CSVMissingColumnError(missingColumns)
    }

    return data.map(values =>
      keys.reduce<Record<string, string>>((record, key, index) => ({
        ...record,
        [key]: values.at(index) ?? ''
      }), {})
    )
  }

  static encode <K extends string> (
    data: Array<Record<K, string>>,
    options?: {
      columns?: readonly K[]
      delimiter?: string
    }
  ): string {
    const keys = options?.columns ?? Object.keys(data[0])
    const delimiter = options?.delimiter ?? ';'

    return [
      keys.join(delimiter),
      ...data.map(item =>
        keys.map(key => item[key]).join(delimiter)
      )
    ].join('\n')
  }
}
