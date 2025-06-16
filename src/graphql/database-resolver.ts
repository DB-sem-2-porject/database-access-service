import { Resolver, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { DatabaseAccessService } from '../database-access.service.ts';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class QueryResult {
    @Field(() => GraphQLJSON)
    result: any;
}

@Resolver()
export class DatabaseResolver {
    constructor(private readonly dbService: DatabaseAccessService) {}

    @Query(() => QueryResult)
    async runQuery(@Args('query') query: string): Promise<QueryResult> {
        const result = await this.dbService.executeQuery(query);
        return {
            result,
        };
    }
}
