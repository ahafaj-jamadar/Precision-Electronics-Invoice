import { useState } from "react";
import { SHOP } from "../../constants/shop";
import { formatDisplayDate, formatDisplayTime } from "../../utils/invoice";

// "Quick Copy" -> "QC". Shown only if the logo file can't be loaded.
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
                    {logoFailed ? (
                        // Fallback only: the name is shown when there is no logo image.
                        <div className="inv-brand-fallback">
                            <div className="inv-monogram" aria-hidden="true">
                                {getInitials(SHOP.name)}
                            </div>
                            <div className="inv-shop-name">{SHOP.name}</div>
                        </div>
                    ) : (
                        <img
                            src={SHOP.logo}
                            alt={`${SHOP.name} logo`}
                            className="inv-logo"
                            onError={() => setLogoFailed(true)}
                            draggable="false"
                        />
                    )}
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