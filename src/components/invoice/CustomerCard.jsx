import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import Collapse from "../ui/Collapse";
import Input from "../ui/Input";

// The optional customer details. Closed by default; starts open if details already exist.
export default function CustomerCard({
    name,
    phone,
    onNameChange,
    onPhoneChange,
}) {
    const hasDetails = name.trim() !== "" || phone.trim() !== "";
    const [open, setOpen] = useState(hasDetails);
    const bodyId = useId();

    // Shown in the title bar while the card is closed.
    const summary = [name.trim(), phone.trim()].filter(Boolean).join(" · ");

    return (
        <section className="card">
            <h2>
                <button
                    type="button"
                    className="card-toggle"
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={() => setOpen((value) => !value)}
                >
                    <span className="card-title">Customer (optional)</span>
                    {!open && summary && <span className="card-summary">{summary}</span>}
                    <ChevronDown size={18} aria-hidden="true" className="card-chevron" />
                </button>
            </h2>

            <Collapse open={open} id={bodyId}>
                <div className="card-body grid gap-3 sm:grid-cols-2">
                    <Input
                        label="Name"
                        placeholder="Optional"
                        autoComplete="off"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                    />
                    <Input
                        label="Mobile number"
                        type="tel"
                        inputMode="tel"
                        maxLength={15}
                        placeholder="Optional"
                        autoComplete="off"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                    />
                </div>
            </Collapse>
        </section>
    );
}