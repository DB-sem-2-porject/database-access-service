import * as Hapi from "@hapi/hapi";
import pg from 'pg';
import { QueryResult } from "pg";
const { Pool } = pg;


export const NUMBER:number = 5;

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
    private pool: pg.Pool;


    constructor(serviceOptions: QueryServiceOptions, databaseOptions: DatabaseOptions) {
        this.port = serviceOptions.port;
        this.host = serviceOptions.host || 'localhost';

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


    private async queryHandler(request: Hapi.Request, responseToolkit: Hapi.ResponseToolkit) {
        const { query } = request.query; // Получаем SQL-запрос из параметра "query" в строке GET запроса
        try {
            const result: QueryResult = await this.pool.query(query);
            return responseToolkit.response(result.rows).code(200); // Отправка данных в JSON
        } catch (error) {
            console.error('Query failed with error: ', error);
            return responseToolkit.response({ error: 'Query failed' }).code(500); // Ошибка запроса
        }
    }


    public start(): void {

        try {
            this.server.start().then(r => {
            });
            process.on('SIGINT', async () => {
                console.log('Stopping server...');
                await this.server.stop();
                process.exit(0);
            });
            console.log(`Server running at: ${this.server.info.uri}`);
        } catch (err) {
            console.error('Failed to start server:', err);
            process.exit(1);
        }
    }


}