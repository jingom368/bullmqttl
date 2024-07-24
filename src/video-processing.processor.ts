// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'; // Adjusted import
// import { Job } from 'bullmq';
import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  InjectQueue,
} from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro, QueuePro } from '@taskforcesh/bullmq-pro';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { VideoService } from './video.service';
import { Observable, of, tap } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Processor('jobQueue', {
  concurrency: 5,
  ttl: 1000,
  group: {
    concurrency: 3,
  },
})
export class VideoProcessingProcessor extends WorkerHost {
  constructor(
    @InjectQueue('jobQueue') private videoQueue: QueuePro,
    @InjectRedis() private readonly redis: Redis, // 'REDIS' 이름으로 Redis 클라이언트 주입
    private readonly videoService: VideoService,
  ) {
    super();
  }

  // Adjusted method signature to match the expected signature from WorkerHost
  async process(job: JobPro): Promise<any> {
    console.log('jobname', job.name);
    let jobProcessPromise;

    switch (job.name) {
      case 'timeout':
        jobProcessPromise = this.videoService.jobProcess('timeout.process.js');
        break;
      // 다른 job.name 값에 대한 case 추가
      case 'infinite-loop':
        jobProcessPromise = this.videoService.jobProcess(
          'infinite-loop.process.js',
        );
        break;
      default:
        throw new Error(`Unhandled job type: ${job.name}`);
    }

    // switch (job.name) {
    //   case 'timeout':
    // 3초 후에 실패하는 Promise 생성
    // const timeoutPromise = new Promise((_, reject) => {
    //   setTimeout(
    //     () => reject(new Error('3초 타임아웃, 작업 실패 처리')),
    //     3000,
    //   );
    // });

    // // jobProcess 호출과 타임아웃 Promise를 경쟁시킴
    // await Promise.race([
    //   this.videoService.jobProcess('timeout.process.js'),
    //   timeoutPromise,
    // ])
    //   .then(() => {
    //     console.log('작업이 성공적으로 완료되었습니다.');
    //   })
    //   .catch(async error => {
    //     console.error('작업 실패 또는 타임아웃:', error);
    //     try {
    //       // 작업 실패 처리
    //       await job.moveToFailed(
    //         new Error('지정된 시간이 지났습니다. 잡을 실패처리 합니다.'),
    //         job.token,
    //         false,
    //       );
    //     } catch (error) {
    //       console.error('잠금 연장 실패:', error);
    //     }
    //   });

    // Observable을 사용하여 비동기 작업 수행
    const observable = new Observable<number>(subscriber => {
      setTimeout(async () => {
        await jobProcessPromise;
        subscriber.next(4);
        subscriber.complete();
      }, 100000); // 100초 후에 next와 complete 호출

      // 구독 취소 시 리소스 정리
      return function unsubscribe() {
        console.log('구독 취소');
      };
    }).pipe(
      timeout({
        each: 3000,
        with: () =>
          of(null).pipe(
            tap(async () => {
              try {
                // 잠금 시간 연장
                console.log('job.token', job.token);
                await job.moveToFailed(
                  new Error('지정된 시간이 지났습니다. 잡을 실패처리 합니다.'),
                  job.token,
                  false,
                );
              } catch (error) {
                console.error('잠금 연장 실패:', error);
                // 잠금 연장 실패 시 작업 실패로 이동
              }
            }),
          ),
      }),
    );

    // Observable 구독
    await new Promise((resolve, reject) => {
      observable.subscribe({
        next: value => console.log(value),
        error: err => {
          console.error(err);
          reject(err); // 에러 발생 시 Promise를 reject
        },
        complete: () => {
          console.log('Completed');
          resolve(null); // 완료 시 Promise를 resolve
        },
      });
    });

    // await new Promise(resolve => setTimeout(resolve, 100000));
    console.log('hello');
  }

  @OnWorkerEvent('failed')
  onEvent(job: JobPro, event: string) {
    console.log(
      `[Unknown Type] Failed job ${job.id} of type ${job.name}: ${event}`,
    );
  }

  @OnWorkerEvent('active')
  async onEventActive(job: JobPro, event: string) {
    console.log(
      `[Unknown Type] Active job ${job.id}, ${job.data.videoId} of ${job.data.groupId}: ${event}`,
    );

    console.log('this.redis.options.host', this.redis.options.host);
    console.log('this.redis.options.port', this.redis.options.port);
  }
}

// jobProcessor에 대한 헬스 체크
// observable에 타임아웃을 걸든지
// job process를 체크하고 복구하는 프로세스
// 그걸 하는 것에 있어서 문제가 없는 지.
// 실행기를 띄웠는데 인큐를 해야 하는데,
// Redis에 이전 친구들이 남아 있을 텐데.
// SIGTERM이 120초의 시간을 주는데, 2분 안에 죽지 않으면. 강제 손실.
// RabbitMQ를 배포 하지 않는데, 서버가 올라오지 않아서 큐만 있다.
// BullMQ를 리스트를 도큐먼트로 리스트를 레디스에 넣어주는?
// JobID로 조합해서 쓰는 방식인데,
// 순서보장은 어떻게 하고 있는가?

// 헬스 체크
// 복구 프로세스
// 레디스 큐 관리

// 벡엔드 작업 프로세스 다뤄야 하는 작업
