// Default services and prices. Edit the names and defaultRate values to match your shop.
// "Other" is handled separately in the app, so it is not listed here.
export const SERVICES = [
    { id: "bw-xerox", name: "Speaker Reconing", defaultRate: 450 },
    { id: "color-xerox", name: "Amplifier Repair", defaultRate: 1500 },
    { id: "lamination", name: "Lamination", defaultRate: 30 },
    { id: "passport-photo", name: "Passport Photo", defaultRate: 50 },
    { id: "mobile-print-bw", name: "Mobile Print B/W", defaultRate: 5 },
    { id: "mobile-print-color", name: "Mobile Print Color", defaultRate: 10 },
    { id: "scan", name: "Scan", defaultRate: 5 },
    { id: "7-12", name: "7/12", defaultRate: 50 },
    { id: "8a", name: "8अ", defaultRate: 50 },
    { id: "service-charge", name: "Service Charge", defaultRate: 500 },
];

// Special entry for custom services typed in by the user.
export const OTHER_SERVICE_ID = "other";