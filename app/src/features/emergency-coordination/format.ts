const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SRI_LANKA_OFFSET_MINUTES = 330;

const pad = (n: number) => String(n).padStart(2, "0");

function toSriLanka(iso: string): Date | null {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getTime() + SRI_LANKA_OFFSET_MINUTES * 60_000);
}

export function formatNumber(value: number): string {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatEventStart(iso: string): string {
    const d = toSriLanka(iso);
    if (!d) return "—";
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function formatClock(iso: string): string {
    const d = toSriLanka(iso);
    if (!d) return "--:--";
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
