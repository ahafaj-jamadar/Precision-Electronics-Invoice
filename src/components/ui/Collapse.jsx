import { useState } from "react";

// The sliding open/close area used by the collapsible cards.
// Once it has finished opening, content may extend past its edge (data-settled),
// for example the payment dropdown list.
export default function Collapse({ open, id, children }) {
    const [settled, setSettled] = useState(open);

    return (
        <div
            id={id}
            className="collapse"
            data-open={open}
            data-settled={open && settled}
            onTransitionEnd={(e) => {
                // Only the card's own height animation counts, not things inside it.
                if (e.target === e.currentTarget) setSettled(open);
            }}
        >
            <div>{children}</div>
        </div>
    );
}