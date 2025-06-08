"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
const fs_1 = require("fs");
function main() {
    let serviceConfigFileContent = (0, fs_1.readFileSync)('./configs/service-config.json', 'utf8');
    let dataBaseFileContent = (0, fs_1.readFileSync)('./configs/database-config.json', 'utf8');
    let serviceConfig = JSON.parse(serviceConfigFileContent);
    let dataBaseConfig = JSON.parse(dataBaseFileContent);
    let service = new service_1.QueryService({
        port: serviceConfig.port,
        host: serviceConfig.host,
    }, {
        host: dataBaseConfig.host,
        port: dataBaseConfig.port,
        database: dataBaseConfig.database,
        user: dataBaseConfig.user,
        password: dataBaseConfig.password,
    });
    service.start();
}
main();
