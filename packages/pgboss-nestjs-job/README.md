## Config

Make sure that the env variable `DATABASE_URI` is defined.

## Usage

1. Create an entrypoint that creates an NestJs application context instance that contains the `PgBossWorkerModule`.

```ts
@Module({
  imports: [
    AppModule.forRoot(),
    PgBossWorkerModule.forRoot({
      queueName, // The name of the queue to process
      concurrency, // The number of jobs to process concurrently
      batchSize, // The number of jobs to fetch
      fetchRefreshThreshold, // Refresh threshold to fetch jobs
      pollInterval // The interval (in milliseconds) to poll for new jobs
    })
  ]
})
class WorkerModule {}

class Worker extends WorkerContainer {
  async bootstrap (): Promise<INestApplicationContext> {
    return await NestFactory.createApplicationContext(WorkerModule)
  }
}

const _worker = new Worker()
```

2. Create a type to define the data your job needs

```ts
export interface MyJobData extends BaseJobData {
  uuid: string
  // other data here
}
```

3. Create a job definition

```ts
@PgBossJob('queue-name')
export class MyJob extends BaseJobConfig<MyJobData> {}
```

4. Create a job handler (make sure to provide it)

```ts
@Injectable()
@PgBossJobHandler(MyJob)
export class MyJobHandler extends BaseJobHandler<MyJobData> {
  public async run (data: MyJobData): Promise<void> {
    // Do stuff
  }
}
```
