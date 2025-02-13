
import { describe, it } from 'node:test'
import { expect } from 'expect'
import { CSVField } from '../csv.field.js'
import { CSVSchema } from '../csv.schema.js'
import { CSVSchemaParseError } from '../errors/csv-schema-parse.error.js'
import assert from 'assert'

enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

enum Pet {
  CAT = 'cat',
  DOG = 'dog'
}

const fields = {
  name: new CSVField({
    name: 'naam',
    type: 'string'
  }),
  firstName: new CSVField({
    name: 'voornaam',
    type: 'string'
  }),
  birthdate: new CSVField({
    name: 'geboortedatum',
    type: 'date'
  }),
  age: new CSVField({
    name: 'leeftijd',
    type: 'int'
  }),
  gender: new CSVField({
    name: 'geslacht',
    type: 'enum',
    enum: Gender,
  }),
  agreed: new CSVField({
    name: 'akkoord',
    type: 'boolean'
  }),
  pets: new CSVField({
    name: 'huisdieren',
    type: 'enum',
    enum: Pet,
    isArray: true
  }),
  remarks: new CSVField({
    name: 'opmerkingen',
    type: 'string',
    nullable: true
  })
}

const schema = new CSVSchema(fields)

describe('Csv Schema', () => {
  let error: Error | undefined

  it('Parse a invalid input', async () => {
    try {
      const parsed = await schema.parse([{
        voornaam: '',
        geboortedatum: '1997-31-45',
        leeftijd: 'very old',
        geslacht: 'alien',
        akkoord: 'agreed',
        huisdieren: 'sister,girlfriend',
        opmerkingen: ''
      }])
    } catch (e) {
      error = e
    }

    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(CSVSchemaParseError)
    assert(error instanceof CSVSchemaParseError)
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'naam', code: 'required' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'voornaam', code: 'not_empty' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'geboortedatum', code: 'invalid_date' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'geslacht', code: 'invalid_enum' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'leeftijd', code: 'invalid_int' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'huisdieren', code: 'invalid_enum' }))
    expect(error.errors).toContainEqual(expect.objectContaining({ rowIndex: 0, column: 'akkoord', code: 'invalid_boolean' }))
  })

  it('Parse a valid input', async () => {
    const parsed = await schema.parse([{
      naam: 'Sijmkens',
      voornaam: 'Maarten',
      geboortedatum: '1997-04-09',
      leeftijd: '27',
      geslacht: 'male',
      akkoord: 'true',
      huisdieren: 'cat,dog',
      opmerkingen: ''
    }])

    expect(parsed[0].name).toEqual('Sijmkens')
    expect(parsed[0].firstName).toEqual('Maarten')
    expect(parsed[0].birthdate).toEqual('1997-04-09')
    expect(parsed[0].age).toEqual(27)
    expect(parsed[0].gender).toEqual(Gender.MALE)
    expect(parsed[0].agreed).toEqual(true)
    expect(parsed[0].pets).toEqual([Pet.CAT, Pet.DOG])
    expect(parsed[0].remarks).toEqual(null)
  })
})
