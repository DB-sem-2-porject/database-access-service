import {
    Not,
    In,
    Like,
    MoreThan,
    LessThan,
    MoreThanOrEqual,
    LessThanOrEqual,
    Equal
} from 'typeorm';

type OperatorKey = 'not' | 'in' | 'like' | 'moreThan' | 'lessThan' | 'moreThanOrEqual' | 'lessThanOrEqual' | 'equal';
const operatorsMap: Record<OperatorKey, (value: any) => any> = {
    not: Not,
    in: In,
    like: Like,
    moreThan: MoreThan,
    lessThan: LessThan,
    moreThanOrEqual: MoreThanOrEqual,
    lessThanOrEqual: LessThanOrEqual,
    equal: Equal,
};


export function parseWhereConditions(raw: any): any {
    if (typeof raw !== 'object' || raw === null) return raw;

    const parsed: any = {};
    for (const key of Object.keys(raw)) {
        if (typeof raw[key] === 'object' && raw[key] !== null) {
            const inner = raw[key];
            const opKey = Object.keys(inner)[0] as OperatorKey;
            const opValue = inner[opKey];
            const operator = operatorsMap[opKey];

            if (operator) {
                parsed[key] = operator(opValue);
            } else {
                parsed[key] = parseWhereConditions(inner);
            }
        } else {
            parsed[key] = raw[key];
        }
    }
    return parsed;
}