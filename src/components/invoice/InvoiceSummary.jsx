import { useId } from "react";
import { ChevronDown } from "lucide-react";
import Collapse from "../ui/Collapse";
import Select from "../ui/Select";
import { PAYMENT_METHODS } from "../../constants/paymentMethods";
import { formatCurrency, formatSignedCurrency } from "../../utils/currency";
import { numberInputProps } from "../../utils/inputProps";

export default function InvoiceSummary({
    open,
    onToggle,
    discount,
    discountType,
    discountError,
    paymentMethod,
    totals,
    onDiscountChange,
    onDiscountTypeChange,
    onPaymentChange,
}) {
    const bodyId = useId();
    const isPercent = discountType === "percent";

    // A discount error keeps the card open, so the red message can't be missed.
    const isOpen = open || Boolean(discountError);

    // Card closed and no discount: show just the Grand Total.
    const compact = !isOpen && !(totals.discount > 0);

    return (
        <section className="card">
            <h2>
                <button
                    type="button"
                    className="card-toggle"
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                    onClick={onToggle}
                >
                    <span className="card-title">Discount &amp; Payment</span>
                    <ChevronDown size={18} aria-hidden="true" className="card-chevron" />
                </button>
            </h2>

            {/* The part that opens and closes */}
            <Collapse open={isOpen} id={bodyId}>
                <div className="card-body" style={{ paddingBottom: 0 }}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="field">
                            <label htmlFor="discount-input" className="field-label">
                                Discount
                            </label>
                            <div className={`input-group ${discountError ? "is-invalid" : ""}`}>
                                <div className="seg" role="group" aria-label="Discount type">
                                    <button
                                        type="button"
                                        className={`seg-btn ${!isPercent ? "is-active" : ""}`}
                                        aria-pressed={!isPercent}
                                        aria-label="Discount in rupees"
                                        onClick={() => onDiscountTypeChange("amount")}
                                    >
                                        ₹
                                    </button>
                                    <button
                                        type="button"
                                        className={`seg-btn ${isPercent ? "is-active" : ""}`}
                                        aria-pressed={isPercent}
                                        aria-label="Discount in percent"
                                        onClick={() => onDiscountTypeChange("percent")}
                                    >
                                        %
                                    </button>
                                </div>
                                <input
                                    {...numberInputProps}
                                    id="discount-input"
                                    className="field-input is-numeric"
                                    max={isPercent ? 100 : undefined}
                                    placeholder="0"
                                    value={discount}
                                    aria-invalid={discountError ? "true" : undefined}
                                    aria-describedby={discountError ? "discount-error" : undefined}
                                    onChange={(e) => onDiscountChange(e.target.value)}
                                />
                            </div>
                            {discountError && (
                                <span id="discount-error" className="field-error">
                                    {discountError}
                                </span>
                            )}
                        </div>

                        <Select
                            label="Payment method"
                            value={paymentMethod}
                            options={PAYMENT_METHODS.map((p) => ({
                                value: p.id,
                                label: p.label,
                            }))}
                            onChange={onPaymentChange}
                        />
                    </div>
                </div>
            </Collapse>

            {/* Always visible, even when the card above is closed */}
            <div className="card-totals">
                <div className="totals" aria-live="polite">
                    {!compact && (
                        <>
                            <div className="totals-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(totals.subtotal)}</span>
                            </div>
                            <div className="totals-row">
                                <span>
                                    Discount
                                    {isPercent && totals.discount > 0 ? ` (${discount}%)` : ""}
                                </span>
                                <span>
                                    {totals.discount > 0 ? "− " : ""}
                                    {formatCurrency(totals.discount)}
                                </span>
                            </div>
                            {totals.roundOff !== 0 && (
                                <div className="totals-row">
                                    <span>Round off</span>
                                    <span>{formatSignedCurrency(totals.roundOff)}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className={`totals-row totals-grand ${compact ? "is-only" : ""}`}>
                        <span>Grand Total</span>
                        <span>{formatCurrency(totals.grandTotal)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}