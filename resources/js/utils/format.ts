interface FormatCurrencyOptions {
    showSymbol?: boolean;
    locale?: string;
    currency?: string;
}

/**
 * Format number as currency
 */
export const formatCurrency = (
    amount: number | string, 
    options: FormatCurrencyOptions = {}
): string => {
    const {
        showSymbol = true,
        locale = 'id-ID',
        currency = 'IDR'
    } = options;

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        return showSymbol ? 'Rp 0' : '0';
    }

    if (showSymbol) {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numericAmount);
    } else {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numericAmount);
    }
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
    if (!value) return 0;
    
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Handle Indonesian decimal format (comma as decimal separator)
    const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
    
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format number with thousand separators (no currency symbol)
 */
export const formatNumber = (value: number | string): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) return '0';
    
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);
};

/**
 * Clean input value for currency input
 */
export const cleanCurrencyInput = (value: string): string => {
    // Allow only digits, dots, and commas
    return value.replace(/[^\d.,]/g, '');
};