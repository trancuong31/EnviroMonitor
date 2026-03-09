import { useState, useEffect } from 'react';
import { MapPin, Image as ImageIcon } from 'lucide-react';
import { getListLayout } from '../api/dashboardApi';
import api from '../../../services/api';

// Cache the promise so we only call the API once when multiple components mount simultaneously
let layoutPromise = null;

/**
 * @param {string} prefix - location group name (first 5 chars of tc_name)
 * @param {number} count - number of items in this group
 * @param {React.ReactNode} children - card or list item elements
 */
const LocationGroupSection = ({ prefix, count, children }) => {
    const [layoutImage, setLayoutImage] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const fetchLayout = async () => {
            try {
                if (!layoutPromise) {
                    layoutPromise = getListLayout();
                }
                const response = await layoutPromise;
                if (!isMounted) return;
                
                const layouts = response?.data?.layouts || [];
                const layout = layouts.find(l => l.position === prefix);
                
                if (layout && layout.images) {
                    try {
                        const parsedImages = JSON.parse(layout.images);
                        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                            setLayoutImage(parsedImages[0]);
                        } else if (typeof parsedImages === 'string') {
                            setLayoutImage(parsedImages);
                        }
                    } catch (e) {
                        setLayoutImage(layout.images);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch layout:", error);
                // Reset promise on error so it can be retried later
                layoutPromise = null;
            }
        };

        fetchLayout();

        return () => {
            isMounted = false;
        };
    }, [prefix]);

    // backendUrl without /api/v1
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/v1\/?$/, '') : '';
    const imageUrl = layoutImage 
        ? (layoutImage.startsWith('http') ? layoutImage : `${backendUrl}${layoutImage.startsWith('/') ? '' : '/'}${layoutImage}`) 
        : null;

    return (
        <section className="animate-fade-in relative">
            {/* Group header */}
            <div className="flex items-center gap-3 mb-4 mt-2">
                <div 
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm relative cursor-pointer hover:border-primary/50 transition-colors z-10 hover:z-50"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-base font-bold text-text tracking-wide font-mono">
                        {prefix}
                    </span>
                    {imageUrl && (
                        <ImageIcon className="w-4 h-4 text-text-muted ml-1" />
                    )}
                    
                    {/* Tooltip Image */}
                    {isHovered && imageUrl && (
                        <div className="absolute left-0 top-[calc(100%+0.5rem)] p-2 bg-surface border border-border shadow-2xl rounded-xl z-[9999] pointer-events-none animate-slide-down origin-top-left" style={{ width: '600px', maxWidth: '80vw' }}>
                            <img 
                                src={imageUrl} 
                                alt={`${prefix} layout`} 
                                className="w-full h-auto rounded-lg object-contain bg-surface-alt"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
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
