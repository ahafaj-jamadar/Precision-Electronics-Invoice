// Spread onto any <input> that takes a number: <input {...numberInputProps} />
export const numberInputProps = {
    type: "number",
    inputMode: "decimal",
    min: 0,
    step: "any",
    onKeyDown: (e) => {
        if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
    },
    onWheel: (e) => e.currentTarget.blur(),
};