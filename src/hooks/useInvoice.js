import { useEffect, useMemo, useState } from "react";
import { calculateTotals } from "../utils/calculations";
import {
    createCustomItem,
    createEmptyInvoice,
    hasInvoiceData,
    syncWithServices,
    validateInvoice,
} from "../utils/invoice";

// New key (v2), because the invoice layout changed. Old drafts are simply ignored.
const STORAGE_KEY = "quick-copy-invoice-draft-v2";

// Restore the draft after a refresh. Falls back to a fresh invoice on any problem.
function loadInitialInvoice() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            if (saved && Array.isArray(saved.items) && saved.invoiceNumber) {
                return {
                    ...createEmptyInvoice(),
                    ...saved,
                    items: syncWithServices(saved.items),
                };
            }
        }
    } catch {
        // Storage blocked or data corrupted: just start fresh.
    }
    return createEmptyInvoice();
}

export default function useInvoice() {
    const [invoice, setInvoice] = useState(loadInitialInvoice);

    // Tells the form which custom row to focus after it is added.
    const [focusRequest, setFocusRequest] = useState(null);

    // Save the draft on every change.
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
        } catch {
            // Ignore: persistence is a convenience, not a requirement.
        }
    }, [invoice]);

    // Calculated values (never stored).
    const totals = useMemo(
        () => calculateTotals(invoice.items, invoice.discount, invoice.discountType),
        [invoice.items, invoice.discount, invoice.discountType]
    );
    const validation = useMemo(() => validateInvoice(invoice), [invoice]);

    /* ---------- Item actions ---------- */

    // "Add Other Service": a new custom row, with the cursor in its name box.
    function addCustomItem() {
        const item = createCustomItem();
        setInvoice((prev) => ({ ...prev, items: [...prev.items, item] }));
        setFocusRequest({ itemId: item.id, nonce: Date.now() });
    }

    // Changes only this invoice, never the default prices in services.js.
    function updateItem(itemId, changes) {
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId ? { ...item, ...changes } : item
            ),
        }));
    }

    // Only custom rows can be removed. Normal services are cleared by emptying the quantity.
    function removeItem(itemId) {
        setInvoice((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    }

    /* ---------- Other fields ---------- */

    const setDiscount = (discount) =>
        setInvoice((prev) => ({ ...prev, discount }));
    const setDiscountType = (discountType) =>
        setInvoice((prev) => ({ ...prev, discountType }));
    const setPaymentMethod = (paymentMethod) =>
        setInvoice((prev) => ({ ...prev, paymentMethod }));
    const setCustomerName = (customerName) =>
        setInvoice((prev) => ({ ...prev, customerName }));
    const setCustomerPhone = (customerPhone) =>
        setInvoice((prev) => ({ ...prev, customerPhone }));

    // Start over: all quantities back to 0, no discount, no customer, new invoice number.
    function resetInvoice() {
        setInvoice(createEmptyInvoice());
        setFocusRequest(null);
    }

    // Puts back an invoice saved earlier (used by "Undo" after Print & New).
    function restoreInvoice(saved) {
        setInvoice(saved);
    }

    return {
        invoice,
        totals,
        validation,
        isDirty: hasInvoiceData(invoice),
        focusRequest,
        addCustomItem,
        updateItem,
        removeItem,
        setDiscount,
        setDiscountType,
        setPaymentMethod,
        setCustomerName,
        setCustomerPhone,
        resetInvoice,
        restoreInvoice,
    };
}