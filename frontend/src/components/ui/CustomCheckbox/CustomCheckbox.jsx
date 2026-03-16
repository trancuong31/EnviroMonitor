import { Check } from 'lucide-react';

/**
 * Custom Checkbox with animated checkmark and theme support
 */
const CustomCheckbox = ({ checked, onChange, label, description, className = '' }) => {
    return (
        <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`
                    w-5 h-5 rounded border transition-all duration-200 ease-in-out
                    flex items-center justify-center
                    ${checked 
                        ? 'bg-primary border-primary' 
                        : 'bg-surface border-border group-hover:border-primary/50'
                    }
                `}>
                    <Check 
                        size={14} 
                        strokeWidth={3.5} 
                        className={`text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} 
                    />
                </div>
            </div>
            {(label || description) && (
                <div className="flex flex-col">
                    {label && <span className={`text-sm tracking-wide font-medium select-none transition-colors ${checked ? 'text-text' : 'text-text-secondary group-hover:text-text'}`}>{label}</span>}
                    {description && <span className="text-[0.8rem] text-text-muted mt-0.5 select-none">{description}</span>}
                </div>
            )}
        </label>
    );
};

export default CustomCheckbox;
