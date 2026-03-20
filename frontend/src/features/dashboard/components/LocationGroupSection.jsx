import { useState, useEffect, useMemo } from 'react';
import { MapPin, Image as ImageIcon, Layers } from 'lucide-react';
import { getListLayout, getListImages } from '../api/dashboardApi';
import api from '../../../services/api';
import LayoutViewerModal from './LayoutViewerModal';

let layoutPromise = null;

/**
 * ==========================================
 * 1. COMPONENT NHÓM CON (5 KÝ TỰ ĐẦU)
 * ==========================================
 * @param {string} prefix - location group name (first 5 chars of tc_name)
 * @param {number} count - number of items in this group
 * @param {React.ReactNode} children - card or list item elements
 */
const LocationGroupSection = ({ prefix, count, children }) => {
    const [layoutImage, setLayoutImage] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

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
        <section className="animate-fade-in relative p-2.5 pt-5 rounded-xl border-2 border-dashed border-border/70 bg-surface/40">
            <div className="absolute top-0 left-4 -translate-y-1/2 flex items-center gap-1.5">
                <div 
                    className="flex items-center gap-1.5 px-2 py-1 bg-surface border border-border rounded-lg shadow-sm relative cursor-pointer hover:border-primary/50 transition-colors z-10 hover:z-50"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsLayoutModalOpen(true)}
                >
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-text tracking-wide font-mono">
                        {prefix?.substring(3)}
                    </span>
                    {imageUrl && (
                        <ImageIcon className="w-3 h-3 text-text-muted ml-0.5" />
                    )}
                </div>
                {/* Huy hiệu số lượng item */}
                <span className="text-[0.6rem] text-text-muted font-bold px-1.5 py-0.5 bg-surface-alt rounded-md border border-border shadow-sm">
                    {count}
                </span>
            </div>

            {/* Group content (cards) */}
            {children}

            {/* Layout Viewer Modal */}
            <LayoutViewerModal
                isOpen={isLayoutModalOpen}
                onClose={() => setIsLayoutModalOpen(false)}
                position={prefix}
            />
        </section>
    );
};

/**
 * ==========================================
 * 2. COMPONENT QUẢN LÝ NHÓM CHA (2 KÝ TỰ ĐẦU)
 * Dùng component này ở nơi bạn đang gọi danh sách.
 * ==========================================
 * @param {Array} items - Mảng dữ liệu thô từ API (các bản ghi)
 * @param {Function} renderItem - Hàm render ra card chi tiết của từng item
 */
export const LocationHierarchyList = ({ items, renderItem }) => {
    // Tự động gom nhóm mỗi khi mảng items thay đổi
    const groupedData = useMemo(() => {
        if (!items || !Array.isArray(items)) return {};

        return items.reduce((acc, item) => {
            // Lấy tên để chia nhóm (đảm bảo tc_name không bị undefined)
            const name = item.tc_name || ''; 
            const parentKey = name.substring(0, 2); // Nhóm Cha: 2 ký tự đầu
            const childKey = name.substring(0, 5);  // Nhóm Con: 5 ký tự đầu

            if (!parentKey) return acc;

            // Khởi tạo nhóm cha nếu chưa có
            if (!acc[parentKey]) {
                acc[parentKey] = {};
            }
            // Khởi tạo nhóm con nếu chưa có
            if (!acc[parentKey][childKey]) {
                acc[parentKey][childKey] = [];
            }

            acc[parentKey][childKey].push(item);
            return acc;
        }, {});
    }, [items]);

    return (
        <div className="flex flex-col gap-10 w-full">
            {Object.entries(groupedData).map(([parentPrefix, childGroups]) => (
                <div key={parentPrefix} className="w-full bg-surface/20 p-5 rounded-[24px] border border-border/20">
                    
                    {/* Header Nhóm Cha */}
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border/40">
                        <Layers className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold text-text uppercase tracking-wider">
                            {parentPrefix}
                        </h1>
                    </div>

                    {/* Lưới các Nhóm Con (5 ký tự) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 pt-2">
                        {Object.entries(childGroups).map(([childPrefix, childItems]) => (
                            <LocationGroupSection 
                                key={childPrefix} 
                                prefix={childPrefix} 
                                count={childItems.length}
                            >
                                {/* Danh sách card item thực tế bên trong nhóm 5 ký tự */}
                                <div className="flex flex-col gap-3 mt-2">
                                    {childItems.map(item => (
                                        <div key={item.id || item.tc_name}>
                                            {renderItem(item)}
                                        </div>
                                    ))}
                                </div>
                            </LocationGroupSection>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LocationGroupSection;