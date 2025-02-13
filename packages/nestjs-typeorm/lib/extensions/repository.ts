import { type EntityManager, type EntityTarget, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm'
import { createTransactionManagerProxy } from './transaction.js'

export class TypeOrmRepository<T extends ObjectLiteral> extends Repository <T> {
  constructor (entity: EntityTarget<T>, manager: EntityManager) {
    super(entity, createTransactionManagerProxy(manager))
  }


  async* findInBatches (
    options: FindOneOptions<T>,
    batchSize: number
  ): AsyncGenerator<T[], void, void> {
    let entities: T[] = []
    let page = 0

    do {
      entities = await this.find({
        ...options,
        take: batchSize,
        skip: batchSize * page++
      })

      if (entities.length === 0) return

      yield entities
    } while (entities.length >= batchSize)
  }

  findByInBatches (
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    batchSize: number
  ): AsyncGenerator<T[], void, void> {
    return this.findInBatches({ where }, batchSize)
  }
}
