import Koa from 'koa';
import Router from '@koa/router';
import {ApolloServer} from '@apollo/server';
import {DataSource} from 'typeorm';
import bodyParser from 'koa-bodyparser';
import {createSchema} from "./graphql/schema.ts";

export interface ServiceConfig {
    port: number;
    host?: string;
}

export class DatabaseAccessService {
    private readonly port: number;
    private readonly host: string;
    private app: Koa;
    private router: Router;
    private dataSource!: DataSource;
    private readonly INTERNAL_SERVICE_TOKEN: string;

    private constructor(serviceConfig: ServiceConfig) {
        this.port = serviceConfig.port;
        this.host = serviceConfig.host || 'localhost';
        this.app = new Koa();
        this.router = new Router();
        this.INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'default-token';

        if (!this.INTERNAL_SERVICE_TOKEN) {
            throw new Error('INTERNAL_SERVICE_TOKEN environment variable is not set');
        }
    }

    static async create(serviceConfig: ServiceConfig): Promise<DatabaseAccessService> {
        const instance = new DatabaseAccessService(serviceConfig);
        instance.dataSource = await instance.fetchDataSource();
        return instance;
    }

    private async fetchDataSource(): Promise<DataSource> {
        try {
            const response = await fetch('http://localhost:40001/internal/data-source', {
                method: 'GET',
                headers: {
                    'service-token': this.INTERNAL_SERVICE_TOKEN || 'default-token',
                }
            });
            console.log('data-source response: ', response);
            if (!response.ok) {
                throw new Error(`Failed to fetch DataSource: ${response.statusText}`);
            }

            const config = await response.json();
            return new DataSource(config);
        } catch (error) {
            console.error('Failed to fetch DataSource config:', error);
            throw error;
        }
    }

    private setupMiddleware(): void {
        this.app.use(bodyParser());
    }

    private setupRoutes(): void {
        this.router.get('/query', async (context) => {
            const queryString = context.query.query as string;
            if (!queryString) {
                context.status = 400;
                context.body = { error: 'Query parameter is required' };
                return;
            }

            try {
                context.body = await this.dataSource.query(queryString);
                context.status = 200;
            } catch (error) {
                console.error('Query failed with error: ', error);
                context.body = { error: 'Query failed' };
                context.status = 500;
            }
        });
    }

    private async setupGraphQL(): Promise<void> {
        const schema = await createSchema();

        const server = new ApolloServer({
            schema
        });

        await server.start();

        this.router.post('/graphql', async (context) => {
            const body = context.request.body as { query: string; variables?: Record<string, unknown> };

            context.body = await server.executeOperation({
                query: body.query,
                variables: body.variables,
            }, {
                contextValue: {
                    dataSource: this.dataSource
                },
            });
        });
    }

    public async start(): Promise<void> {
        try {
            // Get DataSource from migrations service
            await this.dataSource.initialize();

            this.setupMiddleware();
            this.setupRoutes();
            await this.setupGraphQL();

            this.app
                .use(this.router.routes())
                .use(this.router.allowedMethods());

            this.app.listen(this.port, () => {
                console.log(`Server running at http://${this.host}:${this.port}`);
                console.log(`GraphQL endpoint: http://${this.host}:${this.port}/graphql`);
            });

            process.on('SIGINT', async () => {
                console.log('Stopping server...');
                await this.dataSource.destroy();
                process.exit(0);
            });
        } catch (err) {
            console.error('Failed to start services:', err);
            process.exit(1);
        }
    }
}