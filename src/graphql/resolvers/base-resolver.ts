import {Arg, ArgsType, ClassType, Field, Int, Mutation, ObjectType, Query, Resolver} from 'type-graphql';
import {
    FindOptionsOrder,
    FindOptionsWhere,
    In,
    LessThan,
    LessThanOrEqual,
    Like,
    MoreThan,
    MoreThanOrEqual,
    Not
} from 'typeorm';
import {BaseService, Customer} from 'database-entity-service-lib';

// Универсальные аргументы для пагинации
@ArgsType()
export class PaginationArgs {
    @Field(() => Int, { nullable: true, defaultValue: 0 })
    skip?: number = 0;

    @Field(() => Int, { nullable: true, defaultValue: 10 })
    take?: number = 10;
}

// Аргументы для поиска
@ArgsType()
export class FindArgs extends PaginationArgs {
    @Field(() => String, { nullable: true })
    filter?: string;

    @Field(() => String, { nullable: true })
    orderBy?: string;

    @Field(() => [String], { nullable: true })
    relations?: string[];
}


// Фабрика для создания типизированного PaginatedResponse
export function createPaginatedResponse<T extends object>(ItemClass: ClassType<T>) {
    @ObjectType()
    class PaginatedResponse {
        @Field(() => [ItemClass])
        items!: T[];

        @Field(() => Int)
        totalCount!: number;

        @Field()
        hasNextPage!: boolean;

        @Field()
        hasPreviousPage!: boolean;
    }
    return PaginatedResponse;
}

// Простые фильтры
export type FilterInput = {
    [key: string]: any;
    _like?: string;
    _gt?: any;
    _gte?: any;
    _lt?: any;
    _lte?: any;
    _in?: any[];
    _null?: boolean;
};

// Интерфейс для сущности с id
export interface BaseEntity {
    id: number;
}

// Базовый резолвер с полной типизацией
export function createBaseResolver<T extends BaseEntity>(
    entityName: string,
    entityClass: ClassType<T>,
    serviceClass: new (...args: any[]) => BaseService<T>
) {
    // Создаем типизированный PaginatedResponse
    const PaginatedResponseClass = createPaginatedResponse(entityClass);

    @Resolver(() => entityClass)
    abstract class BaseResolverHost {
        protected service: BaseService<T>;

        protected constructor(dataSource: any) {
            this.service = new serviceClass(dataSource, entityClass);
        }

        // Улучшенный билдер условий
        protected buildWhereCondition(filter: FilterInput = {}): FindOptionsWhere<T> {
            const where: any = {};

            for (const [key, value] of Object.entries(filter)) {
                if (key.startsWith('_') || value === undefined) continue;

                if (this.isFilterObject(value)) {
                    where[key] = this.buildFieldCondition(value);
                } else {
                    where[key] = value;
                }
            }

            return where;
        }

        private isFilterObject(value: any): boolean {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        }

        private buildFieldCondition(value: any): any {
            if (value._like !== undefined) return Like(`%${value._like}%`);
            if (value._gt !== undefined) return MoreThan(value._gt);
            if (value._gte !== undefined) return MoreThanOrEqual(value._gte);
            if (value._lt !== undefined) return LessThan(value._lt);
            if (value._lte !== undefined) return LessThanOrEqual(value._lte);
            if (value._in !== undefined) return In(value._in);
            if (value._null !== undefined) return value._null ? null : Not(null);
            return value;
        }

        // Безопасный парсинг JSON
        protected safeJsonParse<T>(json?: string, defaultValue: T = {} as T): T {
            if (!json) return defaultValue;
            try {
                return JSON.parse(json);
            } catch {
                return defaultValue;
            }
        }

        // Универсальный поиск
        @Query(() => [entityClass], { name: `find${entityName}s` })
        async read(
            @Arg('args', () => FindArgs, { nullable: true }) args: FindArgs = new FindArgs()
        ): Promise<T[]> {
            const where = this.buildWhereCondition(this.safeJsonParse(args.filter));
            const order = this.safeJsonParse<FindOptionsOrder<T>>(args.orderBy);

            return this.service.read({
                where,
                order,
                skip: args.skip,
                take: args.take,
                relations: args.relations
            });
        }

        // Поиск с пагинацией
        @Query(() => PaginatedResponseClass, { name: `find${entityName}sWithPagination` })
        async readWithPagination(
            @Arg('args', () => FindArgs, { nullable: true }) args: FindArgs = new FindArgs()
        ): Promise<InstanceType<typeof PaginatedResponseClass>> {
            const where = this.buildWhereCondition(this.safeJsonParse(args.filter));
            const order = this.safeJsonParse<FindOptionsOrder<T>>(args.orderBy);

            const [items, totalCount] = await this.service.readWithCount({
                where,
                order,
                skip: args.skip,
                take: args.take,
                relations: args.relations
            });

            return {
                items,
                totalCount,
                hasNextPage: (args.skip || 0) + (args.take || 10) < totalCount,
                hasPreviousPage: (args.skip || 0) > 0
            } as InstanceType<typeof PaginatedResponseClass>;
        }

        // Поиск одного элемента
        @Query(() => entityClass, { nullable: true, name: `find${entityName}One` })
        async readOne(
            @Arg('filter', () => String) filter: string,
            @Arg('relations', () => [String], { nullable: true }) relations?: string[]
        ): Promise<T | null> {
            const where = this.buildWhereCondition(this.safeJsonParse(filter));
            return this.service.readOne({ where, relations });
        }

        // Получение по ID
        @Query(() => entityClass, { nullable: true, name: `get${entityName}ById` })
        async getById(
            @Arg('id', () => Int) id: number,
            @Arg('relations', () => [String], { nullable: true }) relations?: string[]
        ): Promise<T | null> {
            return this.service.readOne({ where: { id } as any, relations });
        }

        // Базовое удаление
        @Mutation(() => Boolean, { name: `delete${entityName}` })
        async delete(@Arg('id', () => Int) id: number): Promise<boolean> {
            try {
                await this.service.delete({ id } as any);
                return true;
            } catch {
                return false;
            }
        }

        // Массовое удаление
        @Mutation(() => Int, { name: `delete${entityName}s` })
        async deleteMany(
            @Arg('filter', () => String) filter: string
        ): Promise<number> {
            const where = this.buildWhereCondition(this.safeJsonParse(filter));
            return await this.service.delete(where);
        }
    }

    return BaseResolverHost;
}
type FieldConfig = {
    type: any;
    options?: {
        nullable?: boolean;
        defaultValue?: any;
        description?: string;
        // другие возможные опции
    };
};
// Хелпер для создания Input типов
export function createInputType<T extends Record<string, any>>(
    name: string,
    fields: Record<keyof T, FieldConfig>
) {
    @ArgsType()
    class InputType {}

    for (const [key, config] of Object.entries(fields) as [string, FieldConfig][]) {
        Field(() => config.type, config.options || {})(InputType.prototype, key);
    }

    Object.defineProperty(InputType, 'name', { value: `${name}Input` });
    return InputType as new () => T;
}