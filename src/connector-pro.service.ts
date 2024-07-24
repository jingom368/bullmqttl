// connector-pro.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConnectPro } from '@taskforcesh/connector-pro';

@Injectable()
export class ConnectorProService implements OnModuleInit {
  onModuleInit() {
    ConnectPro(
      'My Connection',
      'd3a61a50-846c-4503-85e7-f5159657e27d',
      {
        host: 'localhost',
        port: 6379,
      },
      {
        // team: 'my team',
        // backend: 'ws://localhost:9876',
      },
    );
  }
}
