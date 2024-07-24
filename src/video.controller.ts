// video.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // 단일 아이디와 작업 아이디와 그룹 아이디 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123", "groupId": "group1", "jobName": "normal-completion"}' http://localhost:3000/videos/process-job-group
  @Post('process-job-group')
  async addVideoForProcessingJobGroup(
    @Body('videoId') videoId: string,
    @Body('groupId') groupId: string,
    @Body('jobName') jobName: string,
  ) {
    await this.videoService.addVideoForProcessingJobGroup(
      videoId,
      groupId,
      jobName,
    );
    return {
      message: 'Video processing started',
    };
  }

  @Post('retry-failed-jobs')
  async retryFailedJobsWithSpecificError(@Body('errorMsg') errorMsg: string) {
    await this.videoService.retryFailedJobsWithSpecificError(errorMsg);
    return {
      message: 'Retry failed jobs with specific error',
    };
  }
}
