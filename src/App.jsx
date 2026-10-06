import { useEffect, useRef, useState } from "react";
import { FilePlus2, Printer } from "lucide-react";
import AppLayout from "./components/layout/AppLayout";
import InvoiceForm from "./components/invoice/InvoiceForm";
import InvoicePreview from "./components/invoice/InvoicePreview";
import Button from "./components/ui/Button";
import useInvoice from "./hooks/useInvoice";

// Puts the cursor in the first Quantity box so you can start typing straight away.
// Only on computers with a mouse: on phones it would pop the keyboard up unasked.
function focusFirstQuantity() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  setTimeout(() => {
    document.querySelector('input[data-field="quantity"]')?.focus();
  }, 50);
}

export default function App() {
  const inv = useInvoice();
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState(null);

  // Ready to type as soon as the app opens.
  useEffect(() => {
    focusFirstQuantity();
  }, []);

  // Auto-hide the toast message after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Asks before wiping an invoice that already has data in it.
  function handleNewInvoice() {
    if (inv.isDirty && !window.confirm("Clear this invoice and start a new one?")) {
      return;
    }
    inv.resetInvoice();
    setShowErrors(false);
    focusFirstQuantity();
  }

  // Validates, then opens the browser print dialog.
  // thenReset = true  -> "Print & New Invoice": the invoice is cleared only AFTER
  //                      the print dialog closes, so the printout is never affected.
  function handlePrint(thenReset) {
    if (!inv.validation.isValid) {
      setShowErrors(true);
      setToast({
        message:
          inv.validation.general ||
          "Please fix the highlighted fields before printing.",
      });

      // Jump to the first problem field (or the first Quantity box if nothing is added).
      setTimeout(() => {
        const bad = document.querySelector('[aria-invalid="true"]');
        if (bad) {
          bad.focus();
          bad.scrollIntoView({ block: "center", behavior: "smooth" });
        } else {
          focusFirstQuantity();
        }
      }, 50);
      return;
    }
    setShowErrors(false);

    if (thenReset) {
      const printed = inv.invoice;
      const afterPrint = () => {
        window.removeEventListener("afterprint", afterPrint);
        inv.resetInvoice();
        focusFirstQuantity();
        setToast({
          message: "New invoice ready.",
          actionLabel: "Undo",
          onAction: () => inv.restoreInvoice(printed),
        });
      };
      window.addEventListener("afterprint", afterPrint);
    }

    window.print();
  }

  // Ctrl+P / Cmd+P runs the same safe print as the Print Invoice button.
  // The listener is set up once, so it reads the latest handlePrint through a ref.
  const handlePrintRef = useRef(handlePrint);
  useEffect(() => {
    handlePrintRef.current = handlePrint;
  });
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrintRef.current(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <AppLayout
      onNewInvoice={handleNewInvoice}
      onPrint={() => handlePrint(false)}
      onPrintAndNew={() => handlePrint(true)}
    >
      <div className="app-grid mx-auto grid max-w-3xl grid-cols-1 gap-5 lg:max-w-none lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
        <InvoiceForm inv={inv} showErrors={showErrors} />

        <div className="preview-column">
          <InvoicePreview invoice={inv.invoice} totals={inv.totals} />
        </div>

        {/* Phone-sized screens: print buttons under the preview */}
        <div className="no-print flex flex-col gap-2 sm:hidden">
          <Button icon={Printer} onClick={() => handlePrint(false)}>
            Print Invoice
          </Button>
          <Button
            variant="primary"
            icon={FilePlus2}
            onClick={() => handlePrint(true)}
          >
            Print &amp; New Invoice
          </Button>
        </div>
      </div>

      {toast && (
        <div className="toast no-print" role="status">
          <span>{toast.message}</span>
          {toast.onAction && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                toast.onAction();
                setToast(null);
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </AppLayout>
  );
}