import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Customer, CustomerService} from 'database-entity-service-lib';
import { Injectable } from '@nestjs/common';
import { parseWhereConditions } from "./where-options-parser.js";

@Resolver(() => Customer)
@Injectable()
export class CustomerResolver {
    constructor(private readonly customerService: CustomerService) {}

    @Query(() => [Customer], { name: 'customers' })
    async getCustomers() {
        return this.customerService.read();
    }

    @Query(() => Customer, { name: 'customer', nullable: true })
    async getCustomerById(@Args('id') id: number) {
        return this.customerService.readOne({ where: { id } });
    }

    @Mutation(() => Customer)
    async createCustomer(
        @Args('fullName') fullName: string,
        @Args('phoneNumber', { nullable: true }) phoneNumber?: string,
        @Args('registrationDate', { nullable: true }) registrationDate?: string,
        @Args('birthday', { nullable: true }) birthday?: string,
        @Args('notes', { nullable: true }) notes?: string,
    ) {
        return this.customerService.create({
            fullName,
            phoneNumber,
            registrationDate,
            birthday,
            notes,
        });
    }

    @Mutation(() => [Customer])
    async updateCustomer(
        @Args('id') id: number,
        @Args('fullName', { nullable: true }) fullName?: string,
        @Args('phoneNumber', { nullable: true }) phoneNumber?: string,
        @Args('registrationDate', { nullable: true }) registrationDate?: string,
        @Args('birthday', { nullable: true }) birthday?: string,
        @Args('notes', { nullable: true }) notes?: string,
    ) {
        const updateData: Partial<Customer> = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (registrationDate !== undefined) updateData.registrationDate = registrationDate;
        if (birthday !== undefined) updateData.birthday = birthday;
        if (notes !== undefined) updateData.notes = notes;

        await this.customerService.update({ where: { id } }, updateData);
        return this.customerService.read({ where: { id } });
    }

    @Mutation(() => [Customer])
    async updateCustomerBy(
        @Args('whereJson') whereJson: string,
        @Args('updateData') updateDataJson: string,
    ) {
        const whereObj = parseWhereConditions(JSON.parse(whereJson));
        const updateData = JSON.parse(updateDataJson);
        return this.customerService.update({ where: whereObj }, updateData);
    }


    @Mutation(() => Boolean)
    async deleteCustomer(@Args('id') id: number) {
        const affected = await this.customerService.delete({ id });
        return affected > 0;
    }
}
