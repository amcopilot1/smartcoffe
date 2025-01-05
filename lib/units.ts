export const convertToUsageUnit = (value: number, conversionFactor: number): number => {
    return value * conversionFactor
}

export const convertToIncomingUnit = (value: number, conversionFactor: number): number => {
    return value / conversionFactor
}

export const formatUnitValue = (value: number): string => {
    return value >= 1000 ? (value / 1000).toFixed(2) : value.toFixed(2)
}

export const commonConversionFactors: { [key: string]: number } = {
    'л-мл': 1000,
    'кг-г': 1000,
    'г-мг': 1000,
}

export const getDefaultConversionFactor = (incomingUnit: string, usageUnit: string): number => {
    const key = `${incomingUnit}-${usageUnit}`
    return commonConversionFactors[key] || 1
}

