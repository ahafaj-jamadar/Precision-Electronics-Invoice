import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const ROW_PX = 40; // rough height of one option, used to decide whether to open upwards
const LIST_MAX_PX = 240;

// Custom dropdown.
// options: [{ value: "cash", label: "Cash" }, ...]
// onChange receives the chosen VALUE (not an event).
export default function Select({
    label,
    options = [],
    value,
    onChange,
    error,
    className = "",
    id,
}) {
    const autoId = useId();
    const triggerId = id || `${autoId}-trigger`;
    const labelId = `${autoId}-label`;
    const listId = `${autoId}-list`;
    const optionId = (index) => `${autoId}-option-${index}`;

    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const selectedIndex = Math.max(
        0,
        options.findIndex((o) => o.value === value)
    );
    const selected = options[selectedIndex];

    // Keep the highlighted option visible when the list is scrollable.
    useEffect(() => {
        if (open) {
            listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [open, activeIndex]);

    function openList(startIndex = selectedIndex) {
        // Open upwards if there is not enough room below the box.
        const rect = triggerRef.current.getBoundingClientRect();
        const needed = Math.min(options.length * ROW_PX + 8, LIST_MAX_PX);
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < needed && rect.top > spaceBelow);
        setActiveIndex(startIndex);
        setOpen(true);
    }

    function choose(index) {
        onChange?.(options[index].value);
        setOpen(false);
        triggerRef.current?.focus();
    }

    // Jump to the next option starting with the typed letter (wraps around).
    function findByLetter(letter, from) {
        for (let step = 1; step <= options.length; step++) {
            const index = (from + step) % options.length;
            if (options[index].label.toLowerCase().startsWith(letter)) return index;
        }
        return -1;
    }

    function handleKeyDown(e) {
        const last = options.length - 1;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (open) setActiveIndex((i) => Math.min(i + 1, last));
                else openList();
                break;
            case "ArrowUp":
                e.preventDefault();
                if (open) setActiveIndex((i) => Math.max(i - 1, 0));
                else openList();
                break;
            case "Home":
                if (open) {
                    e.preventDefault();
                    setActiveIndex(0);
                }
                break;
            case "End":
                if (open) {
                    e.preventDefault();
                    setActiveIndex(last);
                }
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (open) choose(activeIndex);
                else openList();
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setOpen(false);
                }
                break;
            case "Tab":
                setOpen(false);
                break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const found = findByLetter(
                        e.key.toLowerCase(),
                        open ? activeIndex : selectedIndex
                    );
                    if (found !== -1) {
                        if (open) setActiveIndex(found);
                        else onChange?.(options[found].value);
                    }
                }
        }
    }

    return (
        <div className="field">
            {label && (
                <span
                    id={labelId}
                    className="field-label"
                    onClick={() => triggerRef.current?.focus()}
                >
                    {label}
                </span>
            )}

            <div className="dd">
                <div
                    ref={triggerRef}
                    id={triggerId}
                    role="combobox"
                    tabIndex={0}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-labelledby={label ? labelId : undefined}
                    aria-activedescendant={open ? optionId(activeIndex) : undefined}
                    aria-invalid={error ? "true" : undefined}
                    className={`field-input dd-trigger ${error ? "is-invalid" : ""} ${className}`}
                    onClick={() => (open ? setOpen(false) : openList())}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setOpen(false)}
                >
                    <span>{selected?.label}</span>
                    <ChevronDown size={16} aria-hidden="true" className="dd-chevron" />
                </div>

                {open && (
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        aria-labelledby={label ? labelId : undefined}
                        className={`dd-list ${openUp ? "is-up" : ""}`}
                        // Keep keyboard focus on the box while clicking an option.
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {options.map((option, index) => (
                            <li
                                key={option.value}
                                id={optionId(index)}
                                role="option"
                                aria-selected={option.value === value}
                                className={`dd-option ${index === activeIndex ? "is-active" : ""} ${option.value === value ? "is-selected" : ""
                                    }`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => choose(index)}
                            >
                                <span>{option.label}</span>
                                {option.value === value && (
                                    <Check size={16} aria-hidden="true" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && <span className="field-error">{error}</span>}
        </div>
    );
}