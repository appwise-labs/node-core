# Node document processor

This package includes several jobs that can be scheduled for the `node-doc-processor` worker.

## Jobs overview

### PDF

- `GeneratePdfFromUrlJob`
  - Generates a PDF from a webpage of a given url and uploads it to a given path in S3
  - [view data](/packages/node-doc-processor/lib/jobs/generate-pdf-from-url/generate-pdf-from-url.data.ts)
- `MergePdfJob`
  - Merges PDF's stored in S3 together and uploads it to a given path in S3
  - [view data](/packages/node-doc-processor/lib/jobs/merge-pdf/merge-pdf.job.ts)

## Usage

```ts
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { MergePdfJob } from '@wisemen/node-doc-processor'

@Injectable()
export class MyService {
    constructor (
        private readonly scheduler: PgBossScheduler
    ) {}

    async run (): Promise<void> {
        await this.scheduler.scheduleJob(new MergePdfJob({
            inputFiles: [
                { s3Path: '/pdf/1.pdf' },
                { s3Path: '/pdf/2.pdf' }
            ],
            outputS3Path: '/pdf/result.pdf'
        }))
    }
}
```

## Advanced usage

### Defining job options

```ts
import { BaseJobConfig, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import { DOC_PROCESSOR_QUEUE_NAME, GeneratePdfFromUrlData } from '@wisemen/node-doc-processor'

@PgBossJob(DOC_PROCESSOR_QUEUE_NAME)
export class GeneratePdfFromUrlJob extends BaseJobConfig<GeneratePdfFromUrlData> {
  uniqueBy (): string {
    return `${this.data?.url}-${this.data?.s3Path}`
  }

  constructor (
    data: GeneratePdfFromUrlData
  ) {
    super(data, {
      priority: 1
      // Other options here
    })
  }
}
```
