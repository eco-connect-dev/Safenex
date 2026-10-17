// Suppress uncaught errors originating from browser extensions (e.g. Urban VPN, ad-blockers)
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener(
        "error",
        (event) => {
            const filename = event?.filename || "";
            const message = (event?.message || "") + (event?.error?.message || "");
            if (
                filename.startsWith("chrome-extension://") ||
                filename.startsWith("moz-extension://") ||
                filename.includes("executors/200.js") ||
                message.includes("M_ID")
            ) {
                event.preventDefault?.();
                event.stopImmediatePropagation?.();
            }
        },
        true
    );

    window.addEventListener(
        "unhandledrejection",
        (event) => {
            const reason = event?.reason;
            const stack = (typeof reason === "object" && reason ? reason.stack : "") || "";
            if (stack.includes("chrome-extension://") || stack.includes("moz-extension://") || stack.includes("M_ID")) {
                event.preventDefault?.();
                event.stopImmediatePropagation?.();
            }
        },
        true
    );
}

export {};
