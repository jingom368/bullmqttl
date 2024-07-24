// video.repository.ts
import { Injectable } from '@nestjs/common';
// import { InjectQueue, InjectFlowProducer } from '@nestjs/bullmq';
// import { Queue, FlowProducer } from 'bullmq';
import { QueuePro, FlowProducerPro } from '@taskforcesh/bullmq-pro';
import {
  InjectQueue,
  InjectFlowProducer,
} from '@taskforcesh/nestjs-bullmq-pro';

@Injectable()
export class VideoQueueRepository {
  constructor(
    @InjectQueue('jobQueue') private videoQueue: QueuePro,
    @InjectFlowProducer('flowProducerName')
    private flowProducer: FlowProducerPro,
  ) {}

  async addVideoForProcessingJobGroup(
    videoId: string,
    groupId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueue.add(
      `${jobName}`,
      { videoId },
      {
        group: {
          id: groupId,
        },
        timestamp: Date.now(),
      },
    );
  }

  async retryFailedJobsWithSpecificError(errorMsg: string) {
    const failedJobs = await this.videoQueue.getFailed();
    console.log('failedJobs', failedJobs);
    const jobsToRetry = failedJobs.filter(job =>
      job.stacktrace[0].includes(errorMsg),
    );
    console.log('job.failedReason', failedJobs[0].failedReason);
    console.log('jobsToRetry', jobsToRetry);
    console.log('jobsToRetry.length', jobsToRetry.length);

    // 각 작업 재시도
    for (const job of jobsToRetry) {
      try {
        // 작업 재시도
        await job.retry();
        console.log(`Job ${job.id} has been retried.`);
      } catch (error) {
        console.error(`Failed to retry job ${job.id}:`, error);
      }
    }
  }
}
