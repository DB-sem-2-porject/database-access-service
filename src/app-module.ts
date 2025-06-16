import { Module, DynamicModule, Global } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HttpModule } from '@nestjs/axios';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request } from 'express';
import { Resolver, Query } from '@nestjs/graphql';
import {AppController} from "./app-controller.js";
import {DatabaseAccessService} from "./database-access-service.js";
import {DatabaseResolver} from "./graphql/database-resolver.js";
import {CustomerService, TradingPointService} from "database-entity-service-lib";
import {CustomerResolver} from "./graphql/customer-resolver.js";
import {TradingPointResolver} from "./graphql/trading-point-resolver.js";

@Resolver()
export class AppResolver {
    @Query(() => String)
    hello(): string {
        return 'Hello from GraphQL!';
    }
}

@Global()
@Module({})
export class AppModule {
    static forRoot(dataSource: DataSource): DynamicModule {
        return {
            module: AppModule,
            providers: [
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
                DatabaseAccessService,
                AppResolver,
                DatabaseResolver,
                CustomerResolver,
                CustomerService,
                TradingPointResolver,
                TradingPointService
            ],
            exports: [DataSource],
            imports: [
                HttpModule,
                GraphQLModule.forRoot<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                    context: ({ req }: { req?: Request }) => {
                        const token = req?.headers?.['service-token'] ?? null;
                        return { token };
                    },
                }),
            ],
            controllers: [AppController],
        };
    }
}

