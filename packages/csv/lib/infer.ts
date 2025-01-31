import { CSVField } from "./csv.field.js"
import { CSVSchema } from "./csv.schema.js"

export type InferValue<T, E, N, R, A> =
  T extends 'string'
    ? (A extends true ? string[] : string)
    | (N extends true ? null : never)
    | (R extends true ? never : undefined)
    : T extends 'int'
      ? (A extends true ? number[] : number)
      | (N extends true ? null : never)
      | (R extends true ? never : undefined)
      : T extends 'boolean'
        ? (A extends true ? boolean[] : boolean)
        | (N extends true ? null : never)
        | (R extends true ? never : undefined)
        : T extends 'enum'
          ? (A extends true ? E[keyof E][] : E[keyof E])
          | (N extends true ? null : never)
          | (R extends true ? never : undefined)
          : T extends 'date'
            ? (A extends true ? string[] : string)
            | (N extends true ? null : never)
            | (R extends true ? never : undefined)
            : never

export type InferField<F> = F extends CSVField<infer T, infer E, infer N, infer R, infer A>
  ? InferValue<T, E, N, R, A>
  : never

export type InferRow<R> = R extends { [key: string]: CSVField<any, any, any, any, any> }
  ? { [K in keyof R]: InferField<R[K]> }
  : never

export type InferSchema<S> = S extends CSVSchema<infer R>
  ? InferRow<R>[]
  : never
