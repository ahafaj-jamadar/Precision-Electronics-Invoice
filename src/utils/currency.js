import { roundMoney } from "./calculations";

// 1250 -> "1,250"   |   125.5 -> "125.50"   |   50 -> "50"
// Uses Indian digit grouping (12,34,567).
export function formatNumber(amount) {
    const value = roundMoney(Number(amount) || 0);
    const hasPaise = Math.round(value * 100) % 100 !== 0;
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: hasPaise ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(value);
}

// 1250 -> "₹1,250"
export function formatCurrency(amount) {
    return `₹${formatNumber(amount)}`;
}

/* ---------- Amount in words (Indian system: Lakh, Crore) ---------- */

const ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
    "Ninety",
];

function twoDigits(n) {
    if (n < 20) return ONES[n];
    const tens = TENS[Math.floor(n / 10)];
    const ones = ONES[n % 10];
    return ones ? `${tens}-${ones}` : tens;
}

function threeDigits(n) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const parts = [];
    if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
    if (rest) parts.push(twoDigits(rest));
    return parts.join(" ");
}

function integerToWords(n) {
    if (n === 0) return "Zero";
    const parts = [];
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;

    if (crore) parts.push(`${integerToWords(crore)} Crore`);
    if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
    if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
    if (n) parts.push(threeDigits(n));
    return parts.join(" ");
}

// 1250   -> "Rupees One Thousand Two Hundred Fifty Only"
// 125.5  -> "Rupees One Hundred Twenty-Five and Fifty Paise Only"
export function amountInWords(amount) {
    const totalPaise = Math.round(roundMoney(Number(amount) || 0) * 100);
    const rupees = Math.floor(totalPaise / 100);
    const paise = totalPaise % 100;

    if (rupees === 0 && paise === 0) return "Rupees Zero Only";
    if (rupees === 0) return `${twoDigits(paise)} Paise Only`;
    if (paise === 0) return `Rupees ${integerToWords(rupees)} Only`;
    return `Rupees ${integerToWords(rupees)} and ${twoDigits(paise)} Paise Only`;
}