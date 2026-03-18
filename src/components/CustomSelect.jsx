import React, { useState, useRef, useEffect, useId } from 'react';

/**
 * CustomSelect — Styled dark glassmorphism dropdown replacement for <select>.
 *
 * Props:
 *   options     : Array<{ value: string, label: string }>
 *   value       : string
 *   onChange    : (value: string) => void
 *   placeholder : string
 *   id          : string (optional)
 *   disabled    : boolean
 */
export default function CustomSelect({ options = [], value, onChange, placeholder = 'Select…', id, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [focusIndex, setFocusIndex] = useState(-1);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const uid = useId();
    const selectId = id || uid;

    const selected = options.find(o => o.value === value);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Keyboard navigation
    function handleKeyDown(e) {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (open && focusIndex >= 0) {
                onChange(options[focusIndex].value);
                setOpen(false);
            } else {
                setOpen(o => !o);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) setOpen(true);
            setFocusIndex(i => Math.min(i + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusIndex(i => Math.max(i - 1, 0));
        }
    }

    function handleSelect(val) {
        onChange(val);
        setOpen(false);
        setFocusIndex(-1);
    }

    return (
        <div
            ref={containerRef}
            className={`custom-select${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={`${selectId}-list`}
            id={selectId}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
                if (disabled) return;
                if (listRef.current && listRef.current.contains(e.target)) return;
                setOpen(o => !o);
            }}
        >
            <div className="custom-select-trigger">
                <span className={`custom-select-value${!selected ? ' placeholder' : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className={`custom-select-arrow material-symbols-outlined${open ? ' rotated' : ''}`}>
                    expand_more
                </span>
            </div>

            <div
                className="custom-select-dropdown"
                role="listbox"
                id={`${selectId}-list`}
                ref={listRef}
            >
                {options.length === 0 ? (
                    <div className="custom-select-empty">No options available</div>
                ) : (
                    options.map((opt, idx) => (
                        <div
                            key={opt.value}
                            role="option"
                            aria-selected={opt.value === value}
                            className={`custom-select-option${opt.value === value ? ' selected' : ''}${focusIndex === idx ? ' focused' : ''}`}
                            onMouseDown={e => { e.preventDefault(); handleSelect(opt.value); }}
                            onMouseEnter={() => setFocusIndex(idx)}
                        >
                            {opt.value === value && (
                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: '#a78bfa', marginRight: '6px', flexShrink: 0 }}>check</span>
                            )}
                            {opt.label}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
