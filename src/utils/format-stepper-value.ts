import { formatTimer } from "@breathly/utils/format-timer"

// Given a number of seconds returns them in a "timer" format (mm:ss).
// E.g.: 120 -> 02:00
export const formatValue = (value: unknown, formatAsTime: boolean, fractionDigits: number) => {
    if (typeof value === "number") {
        if (formatAsTime) {
            if (value == 60) return '1h'
            return formatTimer(Math.round(value*60));
        } else {
            return value.toFixed(fractionDigits);
        }
    }
    return value;
};
