import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Customer } from 'database-entity-service-lib';
import { CustomerService } from 'database-entity-service-lib';
import { DataSource } from 'typeorm';

@Resolver(Customer)
export class CustomerResolver {
    private customerService: CustomerService;

    constructor(dataSource: DataSource) {
        this.customerService = new CustomerService(dataSource);
    }

    // CREATE
    @Mutation(() => Customer)
    async createCustomer(
        @Arg('fullName') fullName: string,
        @Arg('phoneNumber', { nullable: true }) phoneNumber?: string,
        @Arg('birthday', { nullable: true }) birthday?: string,
        @Arg('notes', { nullable: true }) notes?: string
    ): Promise<Customer> {
        return this.customerService.createCustomer({
            fullName,
            phoneNumber,
            birthday,
            notes,
            registrationDate: new Date().toISOString()
        });
    }

    // READ
    @Query(() => [Customer])
    async customers(): Promise<Customer[]> {
        return this.customerService.readAllCustomers();
    }

    @Query(() => Customer, { nullable: true })
    async customer(@Arg('id') id: number): Promise<Customer | null> {
        return this.customerService.readCustomer(id);
    }

    // UPDATE
    @Mutation(() => Customer)
    async updateCustomer(
        @Arg('id') id: number,
        @Arg('fullName', { nullable: true }) fullName?: string,
        @Arg('phoneNumber', { nullable: true }) phoneNumber?: string,
        @Arg('birthday', { nullable: true }) birthday?: string,
        @Arg('notes', { nullable: true }) notes?: string
    ): Promise<Customer> {
        const updatedCustomer = await this.customerService.updateCustomer(id, {
            fullName,
            phoneNumber,
            birthday,
            notes
        });

        if (!updatedCustomer) {
            throw new Error(`Customer with id ${id} not found`);
        }

        return updatedCustomer;
    }

    // DELETE
    @Mutation(() => Boolean)
    async deleteCustomer(@Arg('id') id: number): Promise<boolean> {
        await this.customerService.deleteCustomer({ id });
        return true;
    }
}
