import React from 'react';

/**
 * Botão reutilizável com variantes visuais.
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'|'success'} props.variant - Estilo visual
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do botão
 * @param {boolean} props.disabled - Estado desabilitado
 * @param {React.ReactNode} props.children - Conteúdo do botão
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    children,
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-out cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_4px_20px_-4px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(139,92,246,0.45)]',
        secondary: 'bg-white/[0.04] hover:bg-white/[0.07] text-gray-200 border border-white/[0.08] hover:border-white/[0.12]',
        danger: 'bg-red-500/[0.08] hover:bg-red-500/[0.14] text-red-300 border border-red-500/20 hover:border-red-500/30',
        ghost: 'bg-transparent hover:bg-white/[0.04] text-gray-400 hover:text-gray-200',
        success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.45)]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3.5 text-[15px] gap-2.5',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
