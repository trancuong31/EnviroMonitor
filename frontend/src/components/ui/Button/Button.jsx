/**
 * Reusable Button component with Tailwind CSS
 */

const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-text-secondary hover:bg-gray-100',
    danger: 'bg-error text-white hover:bg-red-600',
    success: 'bg-success text-white hover:bg-green-600',
};

const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    type = 'button',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses =
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer';
    const disabledClasses = 'disabled:opacity-60 disabled:cursor-not-allowed';

    const classes = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.medium,
        disabledClasses,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
