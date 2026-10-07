import { Plus } from "lucide-react";
import Button from "../ui/Button";
import InvoiceItemRow from "./InvoiceItemRow";
import { getInvoiceRows } from "../../utils/invoice";

export default function InvoiceItems({
    items,
    errors,
    generalError,
    showErrors,
    focusRequest,
    onAddCustom,
    onUpdate,
    onRemove,
    onSettle,
    onJumpToDiscount,
}) {
    // Position of each service on the invoice: 1, 2, 3 ... in the order they were added.
    const serials = new Map(
        getInvoiceRows(items).map((item, index) => [item.id, index + 1])
    );

    // Enter jumps to the next Quantity box (or to a custom row's name box).
    // After the last row it jumps to Discount. Tab still moves Quantity → Rate as normal.
    function handleKeyDown(e) {
        if (e.key !== "Enter") return;
        if (!(e.target instanceof HTMLInputElement) || !e.target.dataset.field) {
            return;
        }
        e.preventDefault();

        const fields = Array.from(
            e.currentTarget.querySelectorAll("input[data-field]")
        );
        const index = fields.indexOf(e.target);
        const kind = e.target.dataset.field;

        const next =
            kind === "name"
                ? fields[index + 1]
                : fields.slice(index + 1).find((el) => el.dataset.field !== "rate");

        if (next) {
            next.focus();
            next.select?.();
        } else {
            onJumpToDiscount();
        }
    }

    return (
        <section className="card" aria-labelledby="services-title">
            <div className="card-header">
                <h2 id="services-title" className="card-title">
                    Services
                </h2>
                <Button icon={Plus} onClick={onAddCustom}>
                    Add Other Service
                </Button>
            </div>

            <div className="card-body flex flex-col gap-3">
                <p className="m-0 text-[13px]" style={{ color: "var(--color-muted)" }}>
                    Type a quantity next to each service you need. Services with no
                    quantity are left off the invoice.
                </p>

                {showErrors && generalError && (
                    <div className="field-error" role="alert">
                        {generalError}
                    </div>
                )}

                <div onKeyDown={handleKeyDown}>
                    <div className="item-grid item-head" aria-hidden="true">
                        <span>Service</span>
                        <span className="num">Qty</span>
                        <span className="num">Rate</span>
                        <span className="num">Amount</span>
                        <span />
                    </div>
                    {items.map((item) => (
                        <InvoiceItemRow
                            key={item.id}
                            item={item}
                            serial={serials.get(item.id)}
                            errors={errors[item.id]}
                            showErrors={showErrors}
                            focusRequest={focusRequest}
                            onChange={(changes) => onUpdate(item.id, changes)}
                            onRemove={() => onRemove(item.id)}
                            onSettle={() => onSettle(item.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}