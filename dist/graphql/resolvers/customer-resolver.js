"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResolver = void 0;
const type_graphql_1 = require("type-graphql");
const database_entity_service_lib_1 = require("database-entity-service-lib");
const database_entity_service_lib_2 = require("database-entity-service-lib");
const typeorm_1 = require("typeorm");
let CustomerResolver = class CustomerResolver {
    constructor(dataSource) {
        this.customerService = new database_entity_service_lib_2.CustomerService(dataSource);
    }
    // CREATE
    createCustomer(fullName, phoneNumber, birthday, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.customerService.createCustomer({
                fullName,
                phoneNumber,
                birthday,
                notes,
                registrationDate: new Date().toISOString()
            });
        });
    }
    // READ
    customers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.customerService.readAllCustomers();
        });
    }
    customer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.customerService.readCustomer(id);
        });
    }
    // UPDATE
    updateCustomer(id, fullName, phoneNumber, birthday, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedCustomer = yield this.customerService.updateCustomer(id, {
                fullName,
                phoneNumber,
                birthday,
                notes
            });
            if (!updatedCustomer) {
                throw new Error(`Customer with id ${id} not found`);
            }
            return updatedCustomer;
        });
    }
    // DELETE
    deleteCustomer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.customerService.deleteCustomer({ id });
            return true;
        });
    }
};
exports.CustomerResolver = CustomerResolver;
__decorate([
    (0, type_graphql_1.Mutation)(() => database_entity_service_lib_1.Customer),
    __param(0, (0, type_graphql_1.Arg)('fullName')),
    __param(1, (0, type_graphql_1.Arg)('phoneNumber', { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('birthday', { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)('notes', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerResolver.prototype, "createCustomer", null);
__decorate([
    (0, type_graphql_1.Query)(() => [database_entity_service_lib_1.Customer]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerResolver.prototype, "customers", null);
__decorate([
    (0, type_graphql_1.Query)(() => database_entity_service_lib_1.Customer, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerResolver.prototype, "customer", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => database_entity_service_lib_1.Customer),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __param(1, (0, type_graphql_1.Arg)('fullName', { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('phoneNumber', { nullable: true })),
    __param(3, (0, type_graphql_1.Arg)('birthday', { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)('notes', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerResolver.prototype, "updateCustomer", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerResolver.prototype, "deleteCustomer", null);
exports.CustomerResolver = CustomerResolver = __decorate([
    (0, type_graphql_1.Resolver)(database_entity_service_lib_1.Customer),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CustomerResolver);
