/**
 * Premium Input Component
 * Form input with label, icons, and validation states
 */

import React, { forwardRef } from 'react'

const Input = forwardRef(({ 
  label,
  error,
  helper,
  prefix,
  suffix,
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const wrapperClasses = ['input-wrapper', fullWidth ? 'input-full' : '', className].filter(Boolean).join(' ')
  const inputClasses = ['input-premium', error ? 'input-error' : '', prefix ? 'has-prefix' : '', suffix ? 'has-suffix' : ''].filter(Boolean).join(' ')

  return (
    <div className={wrapperClasses}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input ref={ref} className={inputClasses} {...props} />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
