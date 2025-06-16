import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { DatabaseAccessService } from './database-access.service.ts';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

class SqlQueryDto {
    @IsString()
    query!: string;
}

@ApiTags('SQL')
@Controller('sql')
export class SqlController {
    constructor(private readonly databaseService: DatabaseAccessService) {}

    @Post('query')
    @ApiOperation({ summary: 'Выполнить произвольный SQL-запрос' })
    @ApiBody({ schema: { properties: { query: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Результат выполнения SQL-запроса' })
    async runSql(@Body() body: SqlQueryDto) {
        if (!body.query) {
            throw new BadRequestException('Query parameter is required');
        }
        try {
            return await this.databaseService.executeQuery(body.query);
        } catch (error) {
            throw error;
        }
    }
}

