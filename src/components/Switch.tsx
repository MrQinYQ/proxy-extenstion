import React from 'react';
import useMergedState from '../hooks/useMergedState'

export interface SwitchInterface {
    checked?: boolean,
    defaultChecked?: boolean,
    disabled?: boolean,
    onChange?: (val: boolean, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    onClick?: (val: boolean, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const Switch: React.FunctionComponent<SwitchInterface> = (props) => {
    const { checked, defaultChecked, disabled, onChange, onClick } = props
    const [innerChecked, setInnerChecked] = useMergedState(false, {
        value: checked,
        defaultValue: defaultChecked
    })
    function triggerChange (newChecked: boolean, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        let mergedValue = innerChecked;
        if (!disabled) {
            mergedValue = newChecked;
            setInnerChecked(mergedValue);
            onChange && onChange(mergedValue, event);
        }
        return mergedValue;
    }
    function onInternalClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        var ret = triggerChange(!innerChecked, e);
        onClick && onClick(ret, e);
    }
    return <button type="button" role="switch" aria-checked={innerChecked} disabled={disabled} onClick={onInternalClick}></button>
}

export default Switch;
