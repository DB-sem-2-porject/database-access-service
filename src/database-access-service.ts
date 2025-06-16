import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseAccessService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseAccessService.name);
    private dataSource: DataSource | undefined;
    private readonly INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'default-token';

    constructor(private readonly httpService: HttpService, dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    async onModuleInit() {
        this.logger.log('DatabaseAccessService initialized');
    }

    async executeQuery(query: string): Promise<any> {
        if (!this.dataSource) {
            throw new Error('DataSource not initialized');
        }
        return this.dataSource.query(query);
    }

    async onModuleDestroy() {
        if (this.dataSource?.isInitialized) {
            await this.dataSource.destroy();
            this.logger.log('DataSource destroyed');
        }
    }
}
