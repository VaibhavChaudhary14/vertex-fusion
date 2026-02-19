import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Components ---

/**
 * NeoBox: The fundamental building block.
 * White background, thick black border, hard shadow.
 */
export const NeoBox = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("border-3 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]", className)}>
            {children}
        </div>
    );
};

/**
 * NeoButton: Highly interactive button with press animation.
 */
export const NeoButton = ({ children, onClick, variant = 'primary', className }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; className?: string }) => {
    const colors = {
        primary: 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]',
        secondary: 'bg-[#10B981] text-black hover:bg-[#059669]',
        danger: 'bg-[#F43F5E] text-white hover:bg-[#E11D48]',
    };

    return (
        <motion.button
            whileHover={{ translate: "2px 2px", boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            whileTap={{ translate: "5px 5px", boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
            onClick={onClick}
            className={cn(
                "px-6 py-3 font-mono font-bold uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-colors",
                colors[variant],
                className
            )}
        >
            {children}
        </motion.button>
    );
};

/**
 * NeoCard: A NeoBox with a header and padding.
 */
export const NeoCard = ({ title, children, className, neonColor = "bg-white" }: { title: string; children: React.ReactNode; className?: string, neonColor?: string }) => {
    return (
        <NeoBox className={cn("flex flex-col h-full", className)}>
            <div className={cn("border-b-3 border-black px-4 py-2 font-mono font-bold flex justify-between items-center", neonColor)}>
                <span className="uppercase">{title}</span>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-black bg-white" />
                    <div className="w-3 h-3 rounded-full border-2 border-black bg-black" />
                </div>
            </div>
            <div className="p-4 flex-1">
                {children}
            </div>
        </NeoBox>
    );
};

/**
 * NeoBadge: Status indicator.
 */
export const NeoBadge = ({ status }: { status: string }) => {
    const isDanger = status.toLowerCase().includes('attack') || status.toLowerCase().includes('fail');
    const isWarning = status.toLowerCase().includes('warn');

    return (
        <span className={cn(
            "px-2 py-1 border-2 border-black font-mono text-xs font-bold uppercase",
            isDanger ? "bg-[#F43F5E] text-white" : isWarning ? "bg-[#F59E0B] text-black" : "bg-[#10B981] text-black"
        )}>
            {status}
        </span>
    );
};
