import { forwardRef, useId } from "react";

// A labelled input with optional error text.
// numeric: right-aligns the text (for Qty / Rate / Amount fields).
const Input = forwardRef(function Input(
    { label, error, numeric = false, className = "", id, ...props },
    ref
) {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = `${inputId}-error`;

    const classes = [
        "field-input",
        numeric ? "is-numeric" : "",
        error ? "is-invalid" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="field">
            {label && (
                <label htmlFor={inputId} className="field-label">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={classes}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? errorId : undefined}
                {...props}
            />
            {error && (
                <span id={errorId} className="field-error">
                    {error}
                </span>
            )}
        </div>
    );
});

export default Input;