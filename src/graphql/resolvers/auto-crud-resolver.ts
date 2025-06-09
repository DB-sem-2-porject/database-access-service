import { Resolver, Mutation, Arg, Int, ClassType } from 'type-graphql';
import {BaseService, Customer, CustomerService} from 'database-entity-service-lib';
import { createBaseResolver, BaseEntity } from './base-resolver.js';
import {DeepPartial} from "typeorm";

// Конфигурация для CRUD операций
export interface CrudConfig<T> {
    createFields?: (keyof T)[];
    updateFields?: (keyof T)[];
    excludeCreate?: boolean;
    excludeUpdate?: boolean;
    excludeDelete?: boolean;
    customCreateLogic?: (data: Partial<T>) => Partial<T>;
    customUpdateLogic?: (id: number, data: Partial<T>) => Promise<T | null>;
}

// Автоматический CRUD резолвер
export function createCrudResolver<T extends BaseEntity>(
    entityName: string,
    entityClass: ClassType<T>,
    serviceClass: new (...args: any[]) => BaseService<T>,
    config: CrudConfig<T> = {}
) {
    const BaseResolver = createBaseResolver(entityName, entityClass, serviceClass);

    @Resolver(() => entityClass)
    class CrudResolver extends BaseResolver {
        constructor(dataSource: any) {
            super(dataSource);
        }

        // Автоматическое создание
        @Mutation(() => entityClass, {
            name: `create${entityName}`,
            description: `Create a new ${entityName}`
        })
        async create(
            @Arg('data', () => String) data: string
        ): Promise<T> {
            if (config.excludeCreate) {
                throw new Error(`Create operation is disabled for ${entityName}`);
            }

            let parsedData = this.safeJsonParse<Partial<T>>(data);

            // Фильтруем поля если указаны
            if (config.createFields) {
                parsedData = this.filterFields(parsedData, config.createFields);
            }

            // Применяем кастомную логику
            if (config.customCreateLogic) {
                parsedData = config.customCreateLogic(parsedData);
            }

            return this.service.create(parsedData as DeepPartial<T>);
        }

        // Автоматическое обновление
        @Mutation(() => entityClass, {
            nullable: true,
            name: `update${entityName}`,
            description: `Update an existing ${entityName}`
        })
        async update(
            @Arg('id', () => Int) id: number,
            @Arg('data', () => String) data: string
        ): Promise<T | null> {
            if (config.excludeUpdate) {
                throw new Error(`Update operation is disabled for ${entityName}`);
            }

            // Кастомная логика обновления
            if (config.customUpdateLogic) {
                return config.customUpdateLogic(id, this.safeJsonParse(data));
            }

            let parsedData = this.safeJsonParse<Partial<T>>(data);

            // Фильтруем поля если указаны
            if (config.updateFields) {
                parsedData = this.filterFields(parsedData, config.updateFields);
            }

            const updated = await this.service.update({ where: { id } as any }, parsedData as DeepPartial<T>);
            return updated.length > 0 ? updated[0] : null;
        }

        // Переопределяем delete если нужно исключить
        @Mutation(() => Boolean, { name: `delete${entityName}` })
        async delete(@Arg('id', () => Int) id: number): Promise<boolean> {
            if (config.excludeDelete) {
                throw new Error(`Delete operation is disabled for ${entityName}`);
            }
            return super.delete(id);
        }

        // Хелпер для фильтрации полей
        private filterFields<K extends keyof T>(data: Partial<T>, allowedFields: K[]): Partial<T> {
            const filtered: Partial<T> = {};
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    filtered[field] = data[field];
                }
            });
            return filtered;
        }
    }

    return CrudResolver;
}

// Простейший способ создания полного CRUD резолвера
export function createSimpleCrudResolver<T extends BaseEntity>(
    entityName: string,
    entityClass: ClassType<T>,
    serviceClass: new (...args: any[]) => BaseService<T>
) {
    return createCrudResolver(entityName, entityClass, serviceClass, {});
}

// Пример использования для разных сценариев:

// 1. Полный CRUD без ограничений
export const CustomerResolver = createSimpleCrudResolver('Customer', Customer, CustomerService);

// 2. CRUD с ограничениями
export const ProductResolver = createCrudResolver('Product', Product, ProductService, {
    createFields: ['name', 'price', 'description'],
    updateFields: ['name', 'price', 'description', 'isActive'],
    excludeDelete: true, // Запрещаем удаление продуктов
    customCreateLogic: (data) => ({
        ...data,
        createdAt: new Date().toISOString(),
        isActive: true
    })
});

// 3. Только для чтения
export const LogResolver = createCrudResolver('Log', Log, LogService, {
    excludeCreate: true,
    excludeUpdate: true,
    excludeDelete: true
});

// 4. С кастомной логикой
export const UserResolver = createCrudResolver('User', User, UserService, {
    createFields: ['email', 'name'],
    customCreateLogic: (data) => ({
        ...data,
        password: 'temp_password', // Будет изменен при первом входе
        createdAt: new Date().toISOString(),
        isActive: true
    }),
    customUpdateLogic: async (id, data) => {
        // Кастомная логика обновления пользователя
        if (data.email) {
            // Проверяем уникальность email
            const existing = await this.service.readOne({
                where: { email: data.email, id: Not(id) } as any
            });
            if (existing) {
                throw new Error('Email already exists');
            }
        }

        const updated = await this.service.update({ where: { id } as any }, data);
        return updated.length > 0 ? updated[0] : null;
    }
});