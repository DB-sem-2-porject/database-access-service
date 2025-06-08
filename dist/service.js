"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = exports.NUMBER = void 0;
const Hapi = __importStar(require("@hapi/hapi"));
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
exports.NUMBER = 5;
class QueryService {
    constructor(serviceOptions, databaseOptions) {
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
    queryHandler(request, responseToolkit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query } = request.query;
            try {
                const result = yield this.pool.query(query);
                return responseToolkit.response(result.rows).code(200);
            }
            catch (error) {
                console.error('Query failed with error: ', error);
                return responseToolkit.response({ error: 'Query failed' }).code(500);
            }
        });
    }
    start() {
        try {
            this.server.start().then(r => {
            });
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                console.log('Stopping server...');
                yield this.server.stop();
                process.exit(0);
            }));
            console.log(`Server running at: ${this.server.info.uri}`);
        }
        catch (err) {
            console.error('Failed to start server:', err);
            process.exit(1);
        }
    }
}
exports.QueryService = QueryService;
