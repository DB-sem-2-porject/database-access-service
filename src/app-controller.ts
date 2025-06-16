import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { DatabaseAccessService } from './database-access-service.ts';

@Controller()
export class AppController {
    constructor(private readonly databaseService: DatabaseAccessService) {}

    @Get('query')
    async getQuery(@Query('query') query: string) {
        if (!query) {
            throw new BadRequestException('Query parameter is required');
        }
        try {
            return await this.databaseService.executeQuery(query);
        } catch (error) {
            throw error;
        }
    }
}
