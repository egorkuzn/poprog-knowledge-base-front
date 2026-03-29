import type { Message} from "./Message";

export interface RotatingTextProps {
    messages?: Message[];
    enterMs?: number;
    stayMs?: number;
    exitMs?: number;
    className?: string;
}
