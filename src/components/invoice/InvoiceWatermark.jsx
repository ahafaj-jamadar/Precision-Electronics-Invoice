import { SHOP } from "../../constants/shop";

// Faint logo behind the invoice content.
// It is a CSS background (not an <img>), so the print dialog's
// "Background graphics" checkbox can turn it on and off.
export default function InvoiceWatermark() {
    if (!SHOP.watermark) return null;

    return (
        <div
            aria-hidden="true"
            className="inv-watermark"
            style={{ backgroundImage: `url("${SHOP.watermark}")` }}
        />
    );
}