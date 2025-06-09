import {Resolver, Mutation, Arg, ArgsType, Field, Int} from 'type-graphql';
import { Customer } from 'database-entity-service-lib';
import { CustomerService } from 'database-entity-service-lib';
import {DataSource, FindOptionsWhere} from 'typeorm';
import { createBaseResolver, createInputType } from './base-resolver.js';

// Создаем Input тип для Customer
@ArgsType()
class CreateCustomerInput {
    @Field()
    fullName!: string;

    @Field({ nullable: true })
    phoneNumber?: string;

    @Field({ nullable: true })
    birthday?: string;

    @Field({ nullable: true })
    notes?: string;
}

@ArgsType()
class UpdateCustomerInput {
    @Field({ nullable: true })
    fullName?: string;

    @Field({ nullable: true })
    phoneNumber?: string;

    @Field({ nullable: true })
    birthday?: string;

    @Field({ nullable: true })
    notes?: string;
}

// Создаем базовый класс
const BaseCustomerResolver = createBaseResolver('Customer', Customer, CustomerService);

@Resolver(() => Customer)
export class CustomerResolver extends BaseCustomerResolver {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    // Создание - теперь с единым объектом
    @Mutation(() => Customer)
    async createCustomer(
        @Arg('input', () => CreateCustomerInput) input: CreateCustomerInput
    ): Promise<Customer> {
        return this.service.create({
            ...input,
            registrationDate: new Date().toISOString()
        });
    }

    // Обновление - тоже упрощено
    @Mutation(() => [Customer])
    async updateCustomersByFilter(
        @Arg('where', () => String) whereJson: string,
        @Arg('input', () => UpdateCustomerInput) input: UpdateCustomerInput
    ): Promise<Customer[]> {
        const where = JSON.parse(whereJson) as FindOptionsWhere<Customer>;
        return this.service.update({ where }, input);
    }

    @Mutation(() => Boolean)
    async deleteCustomer(@Arg('id', () => Int) id: number): Promise<boolean> {
        await this.service.delete({ id });
        return true;
    }

    // Метод для массового удаления с фильтром
    @Mutation(() => Boolean)
    async deleteCustomers(
        @Arg('filter', () => String) filter: string
    ): Promise<boolean> {
        const where = this.buildWhereCondition(JSON.parse(filter));
        await this.service.delete(where);
        return true;
    }
}