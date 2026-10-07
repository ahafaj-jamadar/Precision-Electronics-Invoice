import { useLayoutEffect, useRef, useState } from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceFooter from "./InvoiceFooter";
import InvoiceWatermark from "./InvoiceWatermark";
import { PAYMENT_METHODS } from "../../constants/paymentMethods";
import { calculateItemTotal, toNumber } from "../../utils/calculations";
import { amountInWords, formatCurrency, formatNumber } from "../../utils/currency";
import { getInvoiceRows, getItemName } from "../../utils/invoice";

// 210 mm expressed in CSS pixels (210 / 25.4 * 96).
const PAPER_WIDTH_PX = 793.7;

// Space (px) kept free so a scrollbar can never appear in the preview column.
const SAFETY_PX = 4;
// Gap between the sticky header and the top of the preview while scrolling.
const STICKY_GAP_PX = 12;

const px = (value) => parseFloat(value) || 0;

export default function InvoicePreview({ invoice, totals }) {
    const panelRef = useRef(null);
    const stageRef = useRef(null);
    const paperRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [paperHeight, setPaperHeight] = useState(1122.5);

    // Works out how much to shrink the paper on screen:
    //  - always: to fit the width of the column
    //  - wide screens (two columns): also to fit the visible page height, measured
    //    live, so the whole sheet shows without scrolling on any screen or zoom level.
    // Printing ignores this: the print CSS shows the paper at its true A4 size.
    useLayoutEffect(() => {
        const panel = panelRef.current;
        const stage = stageRef.current;
        const paper = paperRef.current;
        if (!panel || !stage || !paper) return;

        const root = document.documentElement;
        const header = document.querySelector(".app-header");
        const main = document.querySelector(".app-main");
        const wide = window.matchMedia("(min-width: 1024px)");

        const update = () => {
            const height = paper.offsetHeight;
            let next = Math.min(1, stage.clientWidth / PAPER_WIDTH_PX);

            if (wide.matches) {
                const headerHeight = header ? header.offsetHeight : 0;
                const mainPadding = main ? px(getComputedStyle(main).paddingTop) : 0;

                // Visible page height right now (excludes browser toolbars and scrollbars).
                const columnMax =
                    root.clientHeight - headerHeight - mainPadding - SAFETY_PX;

                // Tell the CSS how tall the preview column may be, and where it sticks.
                root.style.setProperty("--preview-top", `${headerHeight + STICKY_GAP_PX}px`);
                root.style.setProperty("--preview-max-h", `${columnMax}px`);

                // Space used by the panel's padding, border and the "Live preview" label.
                const panelStyle = getComputedStyle(panel);
                const label = panel.querySelector(".preview-label");
                const chrome =
                    px(panelStyle.paddingTop) +
                    px(panelStyle.paddingBottom) +
                    px(panelStyle.borderTopWidth) +
                    px(panelStyle.borderBottomWidth) +
                    (label
                        ? label.offsetHeight + px(getComputedStyle(label).marginBottom)
                        : 0);

                next = Math.min(next, (columnMax - chrome) / height);
            }

            // Round down to 3 decimals so tiny differences can't cause a resize loop.
            setScale(Math.max(0.2, Math.floor(next * 1000) / 1000));
            setPaperHeight(height);
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(stage);
        observer.observe(paper);
        if (header) observer.observe(header);
        window.addEventListener("resize", update);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    // Only rows with a quantity above 0 (and a name) appear on the invoice.
    // Only rows with a quantity above 0 appear, in the order they were added.
    const rows = getInvoiceRows(invoice.items);
    const paymentLabel =
        PAYMENT_METHODS.find((p) => p.id === invoice.paymentMethod)?.label ?? "";
    const customerName = invoice.customerName.trim();
    const customerPhone = invoice.customerPhone.trim();

    return (
        <div ref={panelRef} className="preview-panel">
            <div className="preview-label">
                <span>Live preview</span>
                <span>A4</span>
            </div>

            <div ref={stageRef}>
                <div
                    className="preview-sizer"
                    style={{
                        width: PAPER_WIDTH_PX * scale,
                        height: paperHeight * scale,
                    }}
                >
                    <div
                        ref={paperRef}
                        id="invoice-paper"
                        className="invoice-paper"
                        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                    >
                        <InvoiceWatermark />

                        <div className="inv-body">
                            <InvoiceHeader
                                invoiceNumber={invoice.invoiceNumber}
                                createdAt={invoice.createdAt}
                                paymentLabel={paymentLabel}
                            />

                            {(customerName || customerPhone) && (
                                <div className="inv-billto">
                                    {customerName && (
                                        <div>
                                            <div className="inv-label">Billed to</div>
                                            <div className="inv-value">{customerName}</div>
                                        </div>
                                    )}
                                    {customerPhone && (
                                        <div>
                                            <div className="inv-label">Mobile</div>
                                            <div className="inv-value">{customerPhone}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <table className="inv-table">
                                <thead>
                                    <tr>
                                        <th className="col-index">#</th>
                                        <th>Service</th>
                                        <th className="col-num col-qty">Qty</th>
                                        <th className="col-num col-rate">Rate</th>
                                        <th className="col-num col-amount">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="inv-empty">
                                                Services will appear here.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((item, index) => {
                                            const rate = toNumber(item.rate);
                                            return (
                                                <tr key={item.id}>
                                                    <td className="col-index">{index + 1}</td>
                                                    <td className="col-service">{getItemName(item)}</td>
                                                    <td className="col-num col-qty">
                                                        {formatNumber(toNumber(item.quantity))}
                                                    </td>
                                                    <td className="col-num col-rate">
                                                        {Number.isNaN(rate) ? "—" : formatCurrency(rate)}
                                                    </td>
                                                    <td className="col-num col-amount">
                                                        {formatCurrency(calculateItemTotal(item))}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>

                            <div className="inv-bottom">
                                <div className="inv-words">
                                    <div className="inv-label">Amount in words</div>
                                    <div className="inv-words-value">
                                        {amountInWords(totals.grandTotal)}
                                    </div>
                                </div>

                                <div className="inv-totals">
                                    <div className="inv-sum-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(totals.subtotal)}</span>
                                    </div>
                                    {totals.discount > 0 && (
                                        <div className="inv-sum-row">
                                            <span>
                                                Discount
                                                {invoice.discountType === "percent" &&
                                                    ` (${formatNumber(toNumber(invoice.discount))}%)`}
                                            </span>
                                            <span>− {formatCurrency(totals.discount)}</span>
                                        </div>
                                    )}
                                    <div className="inv-grand">
                                        <span className="inv-grand-label">Grand Total</span>
                                        <span className="inv-grand-amount">
                                            {formatCurrency(totals.grandTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <InvoiceFooter />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}