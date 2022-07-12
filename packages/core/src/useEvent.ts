import { useCallback, useLayoutEffect, useRef } from "react";
// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
export function useEvent<F extends (...args: any[]) => any>(handler: F): (...args: Parameters<F>) => ReturnType<F> {
    const handlerRef = useRef<F>();

    useLayoutEffect(() => {
        handlerRef.current = handler;
    });

    return useCallback((...args: Parameters<F>) => {
        const fn = handlerRef.current!;
        return fn(...args);
    }, []);
}
