import {useEffect, useState} from 'react';
import {HOME_DATA} from "../../../../data/pages/home/Home";
import type {RotatingTextProps} from "../../../../model/pages/home/RotatingTextProps";

export function RotatingText(
    {
        messages: messagesProp,
        enterMs = 400,
        stayMs = 8000,
        exitMs = 400,
        className = '',
    }: RotatingTextProps
) {
    const messages = messagesProp ? messagesProp : HOME_DATA;
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<'enter' | 'stay' | 'exit'>('enter');

    useEffect(() => {
        setPhase('enter');
        const enterTimeout = setTimeout(() => setPhase('stay'), enterMs);
        const stayTimeout = setTimeout(() => setPhase('exit'), enterMs + stayMs);
        const exitTimeout = setTimeout(
            () => setIndex((i) => (i + 1) % messages.length),
            enterMs + stayMs + exitMs
        );

        return () => {
            clearTimeout(enterTimeout);
            clearTimeout(stayTimeout);
            clearTimeout(exitTimeout);
        };
    }, [index, messages.length, enterMs, stayMs, exitMs]);

    const msg = messages[index];

    return (
        <div className={`text-block rotator rotator-${phase} ${className}`.trim()}>
            <h1>{msg.h1}</h1>
            <h2>{msg.h2}</h2>
        </div>
    );
}

export default RotatingText;
