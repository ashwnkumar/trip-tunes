import { Label } from '@radix-ui/react-label'
import React from 'react'
import { Input } from '../ui/input'

type Props = {
    label?: string
    placeholder?: string
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    id: string
    name: string
    className?: string
    defaultValue?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    autoComplete?: string
    autoFocus?: boolean
    maxLength?: number
    minLength?: number
    max?: number
    min?: number
}

function InputComponent({
    label,
    placeholder = label,
    type = "text",
    value,
    onChange,
    id,
    name,
    className,
    defaultValue,
    required,
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    max,
    min
}: Props) {
    return (
        <div className="flex flex-col items-start justify-center gap-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={className}
                defaultValue={defaultValue}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                maxLength={maxLength}
                minLength={minLength}
                max={max}
                min={min}
            />
        </div>
    )
}

export default InputComponent