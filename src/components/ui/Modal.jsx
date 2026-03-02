import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal overlay reutilizável com animação de fade.
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está visível
 * @param {Function} props.onClose - Callback para fechar
 * @param {string} props.title - Título do modal
 * @param {React.ReactNode} props.children - Conteúdo
 * @param {'sm'|'md'|'lg'} props.size - Largura do modal
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={handleOverlayClick}
        >
            <div
                className={`${sizes[size]} w-full relative rounded-2xl border border-white/[0.06] ring-1 ring-inset ring-white/[0.03] transform transition-all duration-200 scale-100`}
                style={{
                    background: 'linear-gradient(135deg, rgba(22,22,28,0.97) 0%, rgba(16,16,20,0.98) 100%)',
                    boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)',
                }}
            >
                {/* Glow line no topo */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
                    <h3 className="text-[17px] font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-7 py-5 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
