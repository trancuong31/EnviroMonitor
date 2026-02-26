import { MapPin } from 'lucide-react';

/**
 * @param {string} prefix - location group name (first 5 chars of tc_name)
 * @param {number} count - number of items in this group
 * @param {React.ReactNode} children - card or list item elements
 */
const LocationGroupSection = ({ prefix, count, children }) => {
    return (
        <section className="animate-fade-in">
            {/* Group header */}
            <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-base font-bold text-text tracking-wide font-mono">
                        {prefix}
                    </span>
                </div>
                <span className="text-xs text-text-muted font-medium px-2 py-1 bg-surface-alt rounded-lg border border-border">
                    {count}
                </span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Group content (cards or list items) */}
            {children}
        </section>
    );
};

export default LocationGroupSection;
