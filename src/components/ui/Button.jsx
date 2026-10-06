// variant: "primary" | "secondary" | "ghost"
// icon: optional lucide-react icon component, e.g. icon={Printer}
export default function Button({
    variant = "secondary",
    icon: Icon,
    iconOnly = false,
    className = "",
    children,
    type = "button",
    ...props
}) {
    const classes = [
        "btn",
        `btn-${variant}`,
        iconOnly ? "btn-icon" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button type={type} className={classes} {...props}>
            {Icon && <Icon size={16} aria-hidden="true" />}
            {children}
        </button>
    );
}