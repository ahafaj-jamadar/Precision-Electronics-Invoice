import { FilePlus2, Printer, Receipt, RotateCcw, Share2 } from "lucide-react";
import Button from "../ui/Button";
import { SHOP } from "../../constants/shop";

export default function AppLayout({
    onNewInvoice,
    onPrint,
    onPrintAndNew,
    onShare,
    sharing,
    children,
}) {
    return (
        <>
            <header className="app-header">
                <div className="app-brand">
                    <span className="app-brand-icon">
                        <Receipt size={18} aria-hidden="true" />
                    </span>
                    {SHOP.name} Invoice
                </div>

                <div className="flex items-center gap-2">
                    {/* On narrow phones only the icon shows, so the row always fits */}
                    <Button
                        icon={RotateCcw}
                        className="btn-new-compact"
                        aria-label="New Invoice"
                        onClick={onNewInvoice}
                    >
                        <span className="hidden min-[480px]:inline">New Invoice</span>
                    </Button>

                    <Button
                        icon={Share2}
                        className="btn-square"
                        aria-label="Share invoice"
                        title="Share invoice"
                        disabled={sharing}
                        onClick={onShare}
                    />

                    {/* Hidden on phones: the same buttons appear under the preview there */}
                    <div className="hidden items-center gap-2 sm:flex">
                        <Button icon={Printer} onClick={onPrint}>
                            Print Invoice
                        </Button>
                        <Button variant="primary" icon={FilePlus2} onClick={onPrintAndNew}>
                            Print &amp; New Invoice
                        </Button>
                    </div>
                </div>
            </header>

            <main className="app-main mx-auto w-full max-w-[1400px] p-4 md:p-5">
                {children}
            </main>
        </>
    );
}