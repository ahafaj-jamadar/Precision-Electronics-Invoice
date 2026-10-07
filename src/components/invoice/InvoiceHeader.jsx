import { useState } from "react";
import { SHOP } from "../../constants/shop";
import { formatDisplayDate, formatDisplayTime } from "../../utils/invoice";

// "Precision Electronics" -> "PE". Shown only if the logo file can't be loaded.
function getInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

export default function InvoiceHeader({ invoiceNumber, createdAt, paymentLabel }) {
    const [logoFailed, setLogoFailed] = useState(false);
    const date = new Date(createdAt);

    return (
        <>
            <header className="inv-header">
                <div className="inv-brand">
                    <div className="inv-brand-fallback">
                        {/* The rounded square: holds the logo, or the initials if there is no logo */}
                        <div
                            className={`inv-monogram ${logoFailed ? "" : "has-logo"}`}
                            aria-hidden={logoFailed ? "true" : undefined}
                        >
                            {logoFailed ? (
                                getInitials(SHOP.name)
                            ) : (
                                <img
                                    src={SHOP.logo}
                                    alt={`${SHOP.name} logo`}
                                    className="inv-logo"
                                    draggable="false"
                                    onError={() => setLogoFailed(true)}
                                />
                            )}
                        </div>
                        <div className="inv-shop-name">{SHOP.name}</div>
                    </div>
                    <div className="inv-shop-address">{SHOP.address}</div>
                </div>

                <div className="inv-title">INVOICE</div>
            </header>

            <div className="inv-strip">
                <div>
                    <div className="inv-label">Invoice No</div>
                    <div className="inv-value">{invoiceNumber}</div>
                </div>
                <div>
                    <div className="inv-label">Date</div>
                    <div className="inv-value">{formatDisplayDate(date)}</div>
                </div>
                <div>
                    <div className="inv-label">Time</div>
                    <div className="inv-value">{formatDisplayTime(date)}</div>
                </div>
                <div>
                    <div className="inv-label">Payment</div>
                    <div className="inv-value">{paymentLabel}</div>
                </div>
            </div>
        </>
    );
}