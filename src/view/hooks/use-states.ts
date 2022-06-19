import { useState } from 'react'

export function useStates<T extends {}>(initState: T): [T, (newState: Partial<T>) => void] {
    const [state, setStates] = useState(initState)

    return [
        state,
        function (newState) {
            setStates({
                ...state,
                ...newState
            })
        }
    ]
}