// Makes a PNG picture of the invoice sheet (the white A4 page in the preview).
// It photographs a full-size copy drawn off-screen, so the preview's shrinking
// and scrolling don't affect the picture. Resolves to a File.
export async function createInvoiceImage(fileName) {
    const source = document.getElementById("invoice-paper");
    if (!source) throw new Error("Invoice sheet not found");

    // Loaded only when needed, so the app itself stays small and fast.
    const { default: html2canvas } = await import("html2canvas-pro");

    const host = document.createElement("div");
    host.className = "no-print";
    host.style.cssText = "position:absolute;left:-10000px;top:0;";
    const copy = source.cloneNode(true);
    copy.removeAttribute("id");
    copy.style.transform = "none";
    host.appendChild(copy);
    document.body.appendChild(host);

    try {
        await document.fonts.ready;
        await Promise.all(
            Array.from(copy.querySelectorAll("img")).map((img) =>
                img.complete
                    ? null
                    : new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    })
            )
        );
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));

        const canvas = await html2canvas(copy, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false,
            onclone: (doc) => {
                // The picture tool does not reliably support object-fit, so the logo is
                // redrawn as a background image with the same fit (contain or cover).
                const logo = doc.querySelector("img.inv-logo");
                if (logo) {
                    const fit = doc.defaultView.getComputedStyle(logo).objectFit;
                    const box = doc.createElement("div");
                    box.className = "inv-logo";
                    box.style.backgroundImage = `url("${logo.currentSrc || logo.src}")`;
                    box.style.backgroundRepeat = "no-repeat";
                    box.style.backgroundPosition = "center";
                    box.style.backgroundSize = fit === "cover" ? "cover" : "contain";
                    logo.replaceWith(box);
                }
            },
        });

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
                (result) =>
                    result ? resolve(result) : reject(new Error("Could not create the picture")),
                "image/png"
            );
        });
        return new File([blob], fileName, { type: "image/png" });
    } finally {
        host.remove();
    }
}

// Saves a file to the computer's Downloads folder (used when sharing isn't available).
export function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}