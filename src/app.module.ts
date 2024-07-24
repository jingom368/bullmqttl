import { Module } from '@nestjs/common';
import { BullModule } from '@taskforcesh/nestjs-bullmq-pro';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { VideoProcessingProcessor } from './video-processing.processor';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { VideoQueueRepository } from './video.queue.repository';
import { JobProcessor } from './job.processor';
import { ConnectorProService } from './connector-pro.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'jobQueue',
      },
      { name: 'jobChildrenQueue' },
    ),
    BullModule.registerFlowProducer({
      name: 'flowProducerName',
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'jobQueue',
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    BullBoardModule.forFeature({
      name: 'jobChildrenQueue',
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    RedisModule.forRoot({
      config: {
        name: 'REDIS',
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [VideoController],
  providers: [
    VideoService,
    VideoQueueRepository,
    VideoProcessingProcessor,
    JobProcessor,
    ConnectorProService,
  ],
})
export class AppModule {}
