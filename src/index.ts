import {DatabaseAccessService} from './service.ts';
import {readFileSync} from 'node:fs';

async function index() {
    let serviceConfigFileContent = readFileSync('./configs/service-config.json', 'utf8');
    let dataBaseFileContent = readFileSync('./configs/database-config.json', 'utf8');

    let serviceConfig = JSON.parse(serviceConfigFileContent);
    let dataBaseConfig = JSON.parse(dataBaseFileContent);

    let service: DatabaseAccessService = await DatabaseAccessService.create({
        port: serviceConfig.port,
        host: serviceConfig.host,
    });

    const result = await service.start();
    console.log(result);
}

index().then(result => {
    console.log(result);
});
