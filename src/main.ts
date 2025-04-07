import * as Hapi from '@hapi/hapi';
import {QueryService} from "./service";
import {readFileSync} from 'fs';

function main (): void {

    let serviceConfigFileContent = readFileSync('../configs/service-config.json', 'utf8');
    let dataBaseFileContent = readFileSync('../configs/database-config.json', 'utf8');

    let serviceConfig = JSON.parse(serviceConfigFileContent);
    let dataBaseConfig = JSON.parse(dataBaseFileContent)
    let service: QueryService = new QueryService({
        port: serviceConfig.port,
        host: serviceConfig.host,
    },
    {
        host: dataBaseConfig.host,
        port: dataBaseConfig.port,
        database: dataBaseConfig.database,
        user: dataBaseConfig.user,
        password: dataBaseConfig.password,
    });

    // service.start().then(r => );

}