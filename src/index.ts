import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-module.ts';
import { DataSource } from 'typeorm';
import {readFileSync} from "node:fs";
import axios from 'axios';
import * as Entities from "database-entity-service-lib";
const allEntities = Object.values(Entities).filter(entity => typeof entity === 'function');


async function bootstrap() {
    let serviceConfigFileContent = readFileSync('./configs/service-config.json', 'utf8');
    let serviceConfig = JSON.parse(serviceConfigFileContent);
    const port = serviceConfig.port;
    try {
        const response = await axios.get('http://localhost:40001/internal/data-source', {
            headers: {'service-token': process.env.INTERNAL_SERVICE_TOKEN || 'default-token'},
        });
        const config = {
            ...response.data,
            entities: allEntities, // Добавляем entities локально
        };

        const dataSource = new DataSource(config);
        await dataSource.initialize();
        console.log('DataSource initialized successfully');
        const app = await NestFactory.create(AppModule.forRoot(dataSource));
        await app.listen(port);
        console.log('Database Access Service is running on port', port);

    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap().then(result => {
});
