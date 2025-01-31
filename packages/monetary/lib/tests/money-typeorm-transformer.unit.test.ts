import { describe, it } from 'node:test'
import { expect } from 'expect'
import { Monetary } from '../monetary.js'
import {MoneyTypeOrmTransformer} from "../monetary.column.js";

describe('MoneyTypeormTransformer class', () => {
  it('gives a new instance for each combination of currency and precision', () => {
    const usd2 = MoneyTypeOrmTransformer.instance("USD", 2)
    const usd4 = MoneyTypeOrmTransformer.instance("USD", 4)
    const eur2 = MoneyTypeOrmTransformer.instance("EUR", 2)
    const eur4 = MoneyTypeOrmTransformer.instance("EUR", 4)

    expect(usd2).not.toBe(usd4)
    expect(usd2).not.toBe(eur2)
    expect(usd2).not.toBe(eur4)

    expect(usd4).not.toBe(eur2)
    expect(usd4).not.toBe(eur4)

    expect(usd2).not.toBe(eur4)
  })

  it('gives the same instance for the same combination of currency and precision', () => {
    const usd2 = MoneyTypeOrmTransformer.instance("USD", 2)
    const usd2_2 = MoneyTypeOrmTransformer.instance("USD", 2)
    const eur4 = MoneyTypeOrmTransformer.instance("EUR", 4)
    const eur4_2 = MoneyTypeOrmTransformer.instance("EUR", 4)

    expect(usd2).toBe(usd2_2)
    expect(eur4).toBe(eur4_2)
  });
})
