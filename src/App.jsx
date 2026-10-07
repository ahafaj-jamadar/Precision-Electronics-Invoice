import { useEffect, useRef, useState } from "react";
import { FilePlus2, Printer, Share2 } from "lucide-react";
import AppLayout from "./components/layout/AppLayout";
import InvoiceForm from "./components/invoice/InvoiceForm";
import InvoicePreview from "./components/invoice/InvoicePreview";
import Button from "./components/ui/Button";
import { SHOP } from "./constants/shop";
import useInvoice from "./hooks/useInvoice";
import { createInvoiceImage, downloadFile } from "./utils/shareInvoice";

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
  const [sharing, setSharing] = useState(false);

  // Ready to type as soon as the app opens.
  useEffect(() => {
    focusFirstQuantity();
  }, []);

  // Auto-hide the toast message after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.duration ?? 7000);
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

  // Shows what needs fixing and jumps to the first problem field.
  function showProblems(action) {
    setShowErrors(true);
    setToast({
      message: inv.validation.general
        ? `Add at least one item before ${action}.`
        : `Please fix the highlighted fields before ${action}.`,
    });

    setTimeout(() => {
      const bad = document.querySelector('[aria-invalid="true"]');
      if (bad) {
        bad.focus();
        bad.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        focusFirstQuantity();
      }
    }, 50);
  }

  // Validates, then opens the browser print dialog.
  // thenReset = true  -> "Print & New Invoice": the invoice is cleared only AFTER
  //                      the print dialog closes, so the printout is never affected.
  function handlePrint(thenReset) {
    if (!inv.validation.isValid) {
      showProblems("printing");
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

  // Share: makes a picture of the invoice and opens the share window
  // (WhatsApp, Telegram, ...). If this browser can't share files, it saves the picture.
  async function handleShare() {
    if (sharing) return;

    if (!inv.validation.isValid) {
      showProblems("sharing");
      return;
    }
    setShowErrors(false);

    setSharing(true);
    setToast({ message: "Preparing the picture…" });

    try {
      const number = inv.invoice.invoiceNumber.replace(/[^0-9A-Za-z]+/g, "-");
      const file = await createInvoiceImage(`Invoice-${number}.png`);
      const shareData = {
        files: [file],
        title: `Invoice ${inv.invoice.invoiceNumber}`,
        text: `Invoice from ${SHOP.name}`,
      };

      if (navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          setToast(null);
          return;
        } catch (error) {
          if (error.name === "AbortError") {
            // The person closed the share window: nothing more to do.
            setToast(null);
            return;
          }
          if (error.name === "NotAllowedError") {
            // The browser wants a fresh click before it opens the share window.
            setToast({
              message: "The picture is ready.",
              actionLabel: "Share now",
              onAction: () => navigator.share(shareData).catch(() => { }),
              duration: 12000,
            });
            return;
          }
          // Any other problem: save the picture below instead.
        }
      }

      // This browser can't share files: save the picture instead.
      downloadFile(file);
      setToast({
        message:
          "This browser can't open the share window, so the picture was saved. Send it from your Downloads or gallery.",
        duration: 12000,
      });
    } catch {
      setToast({ message: "Could not create the picture. Please try again." });
    } finally {
      setSharing(false);
    }
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
      onShare={handleShare}
      sharing={sharing}
    >
      <div className="app-grid mx-auto grid max-w-3xl grid-cols-1 gap-5 lg:max-w-none lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
        <InvoiceForm inv={inv} showErrors={showErrors} />

        <div className="preview-column">
          <InvoicePreview invoice={inv.invoice} totals={inv.totals} />
        </div>

        {/* Phone-sized screens: buttons under the preview */}
        <div className="no-print flex flex-col gap-2 sm:hidden">
          <Button icon={Printer} onClick={() => handlePrint(false)}>
            Print Invoice
          </Button>
          <Button icon={Share2} disabled={sharing} onClick={handleShare}>
            Share
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