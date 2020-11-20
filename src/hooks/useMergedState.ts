import { useState } from 'react'

export interface useMergedStateOption<P> {
    defaultValue?: P,
    value?: P,
    onChange?: (newVal: P, oldVal: P) => void
}
export default function useMergedState<P> (defaultStateValue: P, option: useMergedStateOption<P>): [P, (newValue: P) => unknown] {
    const { defaultValue, value, onChange } = option;

    const [innerValue, setInnerValue] = useState(() => {
        if (value !== undefined) {
        return value;
        }
        if (defaultValue !== undefined) {
        return defaultValue
        }
        return defaultStateValue
    })

    const mergedValue = value !== undefined ? value : innerValue;

    function triggerChange (newValue: P) {
        setInnerValue(newValue)
        if (newValue !== mergedValue && onChange) {
        onChange(newValue, mergedValue)
        }
    }

    return [mergedValue, triggerChange]
}