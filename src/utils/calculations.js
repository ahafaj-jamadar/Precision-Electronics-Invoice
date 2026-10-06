// All the money math lives here. No screen code.

// Converts typed text to a number. Returns NaN if empty or invalid.
export function toNumber(value) {
    if (value === "" || value === null || value === undefined) return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

// Rounds to 2 decimals so results like 0.1 + 0.2 don't show as 0.30000000000000004.
export function roundMoney(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Quantity × Rate. An invalid row counts as 0 so totals never break.
export function calculateItemTotal(item) {
    const quantity = toNumber(item.quantity);
    const rate = toNumber(item.rate);
    if (!(quantity > 0) || !(rate >= 0)) return 0;
    return roundMoney(quantity * rate);
}

export function calculateSubtotal(items) {
    return roundMoney(
        items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    );
}

// The discount actually applied, in rupees: never negative, never more than the subtotal.
// type "amount"  -> the typed number is rupees
// type "percent" -> the typed number is a percentage of the subtotal (max 100)
export function calculateDiscount(discountInput, subtotal, type = "amount") {
    const value = toNumber(discountInput);
    if (!(value > 0)) return 0;
    const raw = type === "percent" ? (subtotal * Math.min(value, 100)) / 100 : value;
    return roundMoney(Math.min(raw, subtotal));
}

export function calculateGrandTotal(subtotal, discount) {
    return Math.max(0, roundMoney(subtotal - discount));
}

// Convenience: everything at once.
export function calculateTotals(items, discountInput, discountType = "amount") {
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(discountInput, subtotal, discountType);
    const grandTotal = calculateGrandTotal(subtotal, discount);
    return { subtotal, discount, grandTotal };
}

// A row counts only once a quantity above 0 has been entered.
export function isItemActive(item) {
    return toNumber(item.quantity) > 0;
}