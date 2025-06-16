import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import {TradingPoint, TradingPointService, TradingPointType} from 'database-entity-service-lib';
import { Injectable } from '@nestjs/common';
import { parseWhereConditions } from "./where-options-parser.js";

@Resolver(() => TradingPoint)
@Injectable()
export class TradingPointResolver {
    constructor(private readonly tradingPointService: TradingPointService) {}

    @Query(() => [TradingPoint], { name: 'trading_points' })
    async getTradingPoints() {
        const points = await this.tradingPointService.read();
        return points.map(tp => {
            let date = tp.openingDate;
            if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                // Преобразуем строку только с датой в объект Date
                date = new Date(date + 'T00:00:00.000Z');
            } else if (date && typeof date === 'object' && date instanceof Date) {
                // уже Date, ничего не делаем
            }
            return { ...tp, openingDate: date };
        });
    }

    @Query(() => TradingPoint, { name: 'trading_point', nullable: true })
    async getTradingPointById(@Args('id') id: number) {
        const tp = await this.tradingPointService.readOne({ where: { id } });
        if (!tp) return null;
        let date = tp.openingDate;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            // Преобразуем строку только с датой в объект Date
            date = new Date(date + 'T00:00:00.000Z');
        } else if (date && typeof date === 'object' && date instanceof Date) {
            // уже Date, ничего не делаем
        }
        return { ...tp, openingDate: date };
    }

    @Mutation(() => TradingPoint)
    async createTradingPoint(
        @Args('name') name: string,
        @Args('type', { nullable: false }) type?: TradingPointType,
        @Args('address', { nullable: false }) address?: string,
        @Args('sizeSqm', { nullable: false }) sizeSqm?: number,
        @Args('rentCost', { nullable: false }) rentCost?: number,
        @Args('utilityCost', { nullable: false }) utilityCost?: number,
        @Args('counterCount', { nullable: false }) counterCount?: number,
        @Args('floorsCount', { nullable: false }) floorsCount?: number,
        @Args('openingDate', { nullable: true }) openingDate?: Date,
        @Args('active', { nullable: false }) active?: boolean,
    ) {
        let fixedDate = openingDate;
        if (typeof openingDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(openingDate)) {
            fixedDate = new Date(openingDate + 'T00:00:00.000Z');
        }
        const created = await this.tradingPointService.create({
            name:name,
            type:type,
            address:address,
            sizeSqm:sizeSqm,
            rentCost:rentCost,
            utilityCost:utilityCost,
            counterCount:counterCount,
            floorsCount:floorsCount,
            openingDate: fixedDate,
            active:active,
        });
        // Приведение openingDate к Date, если это строка
        let date = created.openingDate;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            date = new Date(date + 'T00:00:00.000Z');
        } else if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(date)) {
            date = new Date(date);
        }
        return { ...created, openingDate: date };
    }

    @Mutation(() => [TradingPoint])
    async updateTradingPointById(
        @Args('id') id: number,
        @Args('name') name: string,
        @Args('type', { nullable: false }) type?: TradingPointType,
        @Args('address', { nullable: false }) address?: string,
        @Args('sizeSqm', { nullable: false }) sizeSqm?: number,
        @Args('rentCost', { nullable: false }) rentCost?: number,
        @Args('utilityCost', { nullable: false }) utilityCost?: number,
        @Args('counterCount', { nullable: false }) counterCount?: number,
        @Args('floorsCount', { nullable: false }) floorsCount?: number,
        @Args('openingDate', { nullable: false }) openingDate?: Date,
        @Args('active', { nullable: false }) active?: boolean,
    ) {
        const updateData: Partial<TradingPoint> = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (address !== undefined) updateData.address = address;
        if (rentCost !== undefined) updateData.rentCost = rentCost;
        if (utilityCost !== undefined) updateData.utilityCost = utilityCost;
        if (counterCount !== undefined) updateData.counterCount = counterCount;
        if (floorsCount !== undefined) updateData.floorsCount = floorsCount;
        if (openingDate !== undefined) updateData.openingDate = openingDate;
        if (active !== undefined) updateData.active = active;


        await this.tradingPointService.update({ where: { id } }, updateData);
        return this.tradingPointService.read({ where: { id } });
    }

    @Mutation(() => [TradingPoint])
    async updateTradingPointBy(
        @Args('whereJson') whereJson: string,
        @Args('updateData') updateDataJson: string,
    ) {
        const whereObj = parseWhereConditions(JSON.parse(whereJson));
        const updateData = JSON.parse(updateDataJson);
        return this.tradingPointService.update({ where: whereObj }, updateData);
    }


    @Mutation(() => Boolean)
    async deleteTradingPoint(@Args('id') id: number) {
        const affected = await this.tradingPointService.delete({ id });
        return affected > 0;
    }
}
