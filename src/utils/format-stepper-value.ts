import { formatTimer } from "@breathly/utils/format-timer"

// If number is time, uses '1h' if it's 1:00:00 otherwise formatTime
// If number is non-time nuemric value, rounds it to fractionDigits
// Otherwise, return value itself (infinity)
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
