import { SHOP } from "../../constants/shop";

export default function InvoiceFooter() {
    return (
        <footer className="inv-footer">
            <div className="inv-footer-inner">
                <div className="inv-thanks">Thank you for your visit!</div>
                <div className="inv-footer-shop">{SHOP.name}</div>
            </div>
        </footer>
    );
}