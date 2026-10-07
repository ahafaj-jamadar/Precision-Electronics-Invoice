import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { OTHER_SERVICE_ID } from "../../constants/services";
import { calculateItemTotal, isItemActive } from "../../utils/calculations";
import { formatCurrency } from "../../utils/currency";
import { getItemName } from "../../utils/invoice";
import { numberInputProps } from "../../utils/inputProps";

const selectOnFocus = (e) => e.target.select();

export default function InvoiceItemRow({
    item,
    serial, // position on the invoice (1, 2, 3 ...), or undefined if not on the invoice
    errors = {},
    showErrors,
    focusRequest,
    onChange,
    onRemove,
    onSettle,
}) {
    const nameRef = useRef(null);
    const [touched, setTouched] = useState({});

    const isCustom = item.serviceId === OTHER_SERVICE_ID;
    const active = isItemActive(item);
    const label = getItemName(item) || "custom service";

    // A freshly added custom row asks for focus: put the cursor in its name box.
    useEffect(() => {
        if (focusRequest && focusRequest.itemId === item.id) {
            nameRef.current?.focus();
        }
        // Only re-run when a new focus request arrives.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusRequest]);

    const touch = (field) => () =>
        setTouched((t) => ({ ...t, [field]: true }));

    // Show an error only after the field was visited, or after a print attempt.
    const shown = (field) =>
        Boolean(errors[field]) && (touched[field] || showErrors);

    const messages = ["service", "rate"].filter(shown).map((f) => errors[f]);

    return (
        <div className={`svc-row ${active ? "is-active" : ""}`}>
            <div className="item-grid">
                <div className="item-cell item-cell-service">
                    <div className="svc-line">
                        <span
                            className={`serial-badge ${serial ? "" : "is-empty"}`}
                            title="Position on the invoice"
                            aria-hidden="true"
                        >
                            {serial ?? ""}
                        </span>

                        {isCustom ? (
                            <input
                                ref={nameRef}
                                data-field="name"
                                type="text"
                                className={`field-input ${shown("service") ? "is-invalid" : ""}`}
                                aria-label="Custom service name"
                                aria-invalid={shown("service") || undefined}
                                placeholder="Service name, e.g. Document Binding"
                                value={item.customName}
                                onChange={(e) => onChange({ customName: e.target.value })}
                                onBlur={touch("service")}
                            />
                        ) : (
                            <span className="svc-name">{getItemName(item)}</span>
                        )}
                    </div>
                </div>

                <div className="item-cell">
                    <span className="mobile-label">Qty</span>
                    <input
                        {...numberInputProps}
                        data-field="quantity"
                        className="field-input is-numeric"
                        aria-label={`Quantity for ${label}`}
                        placeholder="0"
                        value={item.quantity}
                        onFocus={selectOnFocus}
                        onChange={(e) => onChange({ quantity: e.target.value })}
                        onBlur={onSettle}
                    />
                </div>

                <div className="item-cell">
                    <span className="mobile-label">Rate (₹)</span>
                    <input
                        {...numberInputProps}
                        data-field="rate"
                        className={`field-input is-numeric ${shown("rate") ? "is-invalid" : ""}`}
                        aria-label={`Rate per unit for ${label}`}
                        aria-invalid={shown("rate") || undefined}
                        placeholder="0"
                        value={item.rate}
                        onFocus={selectOnFocus}
                        onChange={(e) => onChange({ rate: e.target.value })}
                        onBlur={touch("rate")}
                    />
                </div>

                <div className="item-cell">
                    <span className="mobile-label">Amount</span>
                    <output className="item-amount" aria-label={`Amount for ${label}`}>
                        {formatCurrency(calculateItemTotal(item))}
                    </output>
                </div>

                <div className="item-cell item-cell-remove">
                    {isCustom && (
                        <Button
                            variant="ghost"
                            iconOnly
                            icon={Trash2}
                            aria-label={`Remove ${label}`}
                            onClick={onRemove}
                        />
                    )}
                </div>
            </div>

            {messages.length > 0 && (
                <div className="item-error">{messages.join(" · ")}</div>
            )}
        </div>
    );
}