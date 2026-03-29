import {useEffect, useState} from "react";

interface RemoteDataState<T> {
    data: T | null
    error: string | null
    isLoading: boolean
}

const initialState = <T,>(): RemoteDataState<T> => ({
    data: null,
    error: null,
    isLoading: true
});

export function useRemoteData<T>(loader: () => Promise<T>): RemoteDataState<T> {
    const [state, setState] = useState<RemoteDataState<T>>(initialState);

    useEffect(() => {
        let isCancelled = false;

        setState(initialState());

        loader()
            .then((data) => {
                if (!isCancelled) {
                    setState({
                        data,
                        error: null,
                        isLoading: false
                    });
                }
            })
            .catch((error: Error) => {
                if (!isCancelled) {
                    setState({
                        data: null,
                        error: error.message,
                        isLoading: false
                    });
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [loader]);

    return state;
}
