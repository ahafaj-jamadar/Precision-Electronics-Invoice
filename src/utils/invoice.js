import { SERVICES, OTHER_SERVICE_ID } from "../constants/services";
import { DEFAULT_PAYMENT_METHOD } from "../constants/paymentMethods";
import { calculateSubtotal, isItemActive, toNumber } from "./calculations";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad = (n) => String(n).padStart(2, "0");

/* ---------- Date / time / invoice number ---------- */

// "02-10-2026 14:35"
export function formatInvoiceNumber(date) {
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// "02 Oct 2026"
export function formatDisplayDate(date) {
    return `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "02:35 PM"
export function formatDisplayTime(date) {
    const hours = date.getHours();
    const hour12 = hours % 12 || 12;
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${pad(hour12)}:${pad(date.getMinutes())} ${suffix}`;
}

/* ---------- Services ---------- */

export function getService(serviceId) {
    return SERVICES.find((s) => s.id === serviceId);
}

// The name shown on the invoice for an item.
export function getItemName(item) {
    if (item.serviceId === OTHER_SERVICE_ID) return item.customName.trim();
    return getService(item.serviceId)?.name ?? "";
}

// The rows that appear on the invoice, in the order they were added.
// (Rows without a recorded order, for example from an old saved draft, keep their list order.)
export function getInvoiceRows(items) {
    return items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isItemActive(item) && getItemName(item))
        .sort(
            (a, b) =>
                (a.item.order ?? Infinity) - (b.item.order ?? Infinity) ||
                a.index - b.index
        )
        .map(({ item }) => item);
}

/* ---------- Creating invoices and items ---------- */

export function createId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Quantity starts empty (= 0), so the row stays off the invoice until used.
export function createItem({ serviceId = "", rate = "", quantity = "" } = {}) {
    return { id: createId(), serviceId, customName: "", quantity, rate, order: null };
}

// One ready-made row for every service in services.js, with its default rate.
export function createPresetItems() {
    return SERVICES.map((s) =>
        createItem({ serviceId: s.id, rate: String(s.defaultRate) })
    );
}

// A blank custom ("Other") row where the user types the service name.
export function createCustomItem() {
    return createItem({ serviceId: OTHER_SERVICE_ID });
}

// Keeps a saved draft in step with services.js: every current service gets a row
// (in services.js order), and any custom rows stay at the end.
export function syncWithServices(savedItems = []) {
    const presets = SERVICES.map(
        (s) =>
            savedItems.find((i) => i.serviceId === s.id) ??
            createItem({ serviceId: s.id, rate: String(s.defaultRate) })
    );
    const customs = savedItems.filter((i) => i.serviceId === OTHER_SERVICE_ID);
    return [...presets, ...customs];
}

export function createEmptyInvoice() {
    const now = new Date();
    return {
        invoiceNumber: formatInvoiceNumber(now),
        createdAt: now.toISOString(),
        customerName: "",
        customerPhone: "",
        items: createPresetItems(),
        discount: "",
        discountType: "amount", // "amount" = rupees, "percent" = % of the subtotal
        paymentMethod: DEFAULT_PAYMENT_METHOD,
    };
}

// True if the user has entered anything worth warning about before clearing.
export function hasInvoiceData(invoice) {
    return (
        invoice.items.some(isItemActive) ||
        invoice.customerName.trim() !== "" ||
        invoice.customerPhone.trim() !== "" ||
        invoice.discount !== ""
    );
}

/* ---------- Validation ---------- */

// Only rows with a quantity above 0 are checked. Returns messages only;
// the screen decides when to show them.
export function validateInvoice(invoice) {
    const itemErrors = {};
    const activeItems = invoice.items.filter(isItemActive);

    activeItems.forEach((item) => {
        const errors = {};

        if (item.serviceId === OTHER_SERVICE_ID && !item.customName.trim()) {
            errors.service = "Enter a service name";
        }

        const rate = toNumber(item.rate);
        if (Number.isNaN(rate)) errors.rate = "Enter a rate";
        else if (rate < 0) errors.rate = "Must be 0 or more";

        if (Object.keys(errors).length > 0) itemErrors[item.id] = errors;
    });

    let discountError = "";
    if (invoice.discount !== "") {
        const discount = toNumber(invoice.discount);
        if (Number.isNaN(discount)) discountError = "Enter a valid number";
        else if (discount < 0) discountError = "Must be 0 or more";
        else if (invoice.discountType === "percent") {
            if (discount > 100) discountError = "Cannot be more than 100%";
        } else if (discount > calculateSubtotal(invoice.items)) {
            discountError = "Cannot be more than the subtotal";
        }
    }

    const generalError =
        activeItems.length === 0 ? "Add at least one item before printing." : "";

    return {
        items: itemErrors,
        discount: discountError,
        general: generalError,
        isValid:
            Object.keys(itemErrors).length === 0 &&
            !discountError &&
            !generalError,
    };
}