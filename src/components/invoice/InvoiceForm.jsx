import { useState } from "react";
import CustomerCard from "./CustomerCard";
import InvoiceItems from "./InvoiceItems";
import InvoiceSummary from "./InvoiceSummary";

const PAYMENT_CARD_KEY = "quick-copy-payment-card-open";

// Remembers whether the Discount & Payment card was left open or closed.
function loadPaymentOpen() {
    try {
        return window.localStorage.getItem(PAYMENT_CARD_KEY) !== "false";
    } catch {
        return true;
    }
}

export default function InvoiceForm({ inv, showErrors }) {
    const { invoice, totals, validation, focusRequest } = inv;
    const [paymentOpen, setPaymentOpen] = useState(loadPaymentOpen);

    // The title bar toggles the card, and the choice is remembered.
    function togglePayment() {
        const next = !paymentOpen;
        setPaymentOpen(next);
        try {
            window.localStorage.setItem(PAYMENT_CARD_KEY, String(next));
        } catch {
            // Ignore: remembering the choice is only a convenience.
        }
    }

    // Enter after the last quantity: open the card (if closed) and put the cursor in Discount.
    // This opens it for now only; it does not change the remembered choice.
    function jumpToDiscount() {
        setPaymentOpen(true);
        requestAnimationFrame(() => {
            const input = document.getElementById("discount-input");
            input?.focus();
            input?.select?.();
        });
    }

    return (
        <div className="no-print flex flex-col gap-4">
            <InvoiceItems
                items={invoice.items}
                errors={validation.items}
                generalError={validation.general}
                showErrors={showErrors}
                focusRequest={focusRequest}
                onAddCustom={inv.addCustomItem}
                onUpdate={inv.updateItem}
                onRemove={inv.removeItem}
                onJumpToDiscount={jumpToDiscount}
            />

            <InvoiceSummary
                open={paymentOpen}
                onToggle={togglePayment}
                discount={invoice.discount}
                discountType={invoice.discountType}
                discountError={validation.discount}
                paymentMethod={invoice.paymentMethod}
                totals={totals}
                onDiscountChange={inv.setDiscount}
                onDiscountTypeChange={inv.setDiscountType}
                onPaymentChange={inv.setPaymentMethod}
            />

            {/* "key" makes the card start fresh (closed) for every new invoice */}
            <CustomerCard
                key={invoice.createdAt}
                name={invoice.customerName}
                phone={invoice.customerPhone}
                onNameChange={inv.setCustomerName}
                onPhoneChange={inv.setCustomerPhone}
            />
        </div>
    );
}