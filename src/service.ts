import * as Hapi from '@hapi/hapi';
import {Pool, QueryResult} from "pg";



export interface QueryServiceOptions {
    port: number;
    host?: string;
}
export interface DatabaseOptions {
    user: string;
    host?: string;
    database: string;
    password: string;
    port: number;
}

export class QueryService {
    private port: number;
    private host: string;
    private server: Hapi.Server;
    private pool: Pool;


    constructor(serviceOptions: QueryServiceOptions, databaseOptions: DatabaseOptions) {
        this.server = Hapi.server({
            port: serviceOptions.port,
            host: serviceOptions.host || 'localhost',
        });

        this.pool = new Pool({
            host: serviceOptions.host || 'localhost',
            port: serviceOptions.port,
            database: databaseOptions.database,
            user: databaseOptions.user,
            password: databaseOptions.password,
        });

        this.server.route({
            method: 'GET',
            path: '/query',
            handler: this.queryHandler.bind(this)
        });
    }

    private async makeQuery(query: string) {
        try {
            const result: QueryResult =  await this.pool.query(query);
        } catch (error) {
            console.error('Query failed with error: ', error);
        }
    }

    private async queryHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
        const query = 'SELECT * FROM your_table';  // Пример запроса
        try {
            const result: QueryResult = await this.pool.query(query);
            return h.response(result.rows).code(200); // Отправка данных в JSON
        } catch (error) {
            console.error('Query failed with error: ', error);
            return h.response({ error: 'Query failed' }).code(500); // Ошибка запроса
        }
    }


    public async start(): Promise<void> {




        await this.server.start();
        console.log(`Server running on https://${this.host}:${this.port}`);
    }
}