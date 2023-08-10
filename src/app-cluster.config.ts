import { Injectable } from '@nestjs/common';
import * as Cluster from 'cluster';
const cluster = Cluster as any;
import { cpus } from 'os';

@Injectable()
export class AppClusterConfig {
  static clusterize(bootstrap: any): void {
    if (cluster.isPrimary) {
      const numCPUs: number = cpus().length;
      console.log(
        `Master server started on ${process.pid} with ${numCPUs} CPUs`,
      );
      for (let i = 0; i < numCPUs; i++) cluster.fork();
      cluster.on('exit', () => cluster.fork());
      return;
    }
    console.log(`Cluster server started on ${process.pid}`);
    bootstrap();
  }
}
