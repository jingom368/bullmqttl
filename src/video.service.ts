import { Injectable } from '@nestjs/common';
import { VideoQueueRepository } from './video.queue.repository';
import { JobProcessor } from './job.processor';

@Injectable()
export class VideoService {
  constructor(
    private readonly videoQueueRepository: VideoQueueRepository,
    private readonly jobProcessor: JobProcessor,
  ) {
    console.log('VideoService initialized');
  }

  async addVideoForProcessingJobGroup(
    videoId: string,
    groupId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingJobGroup(
      videoId,
      groupId,
      jobName,
    );
  }

  async jobProcess(file: string): Promise<void> {
    return await this.jobProcessor.process(file);
  }

  async retryFailedJobsWithSpecificError(errorMsg: string): Promise<void> {
    await this.videoQueueRepository.retryFailedJobsWithSpecificError(errorMsg);
  }
}
