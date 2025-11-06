import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { DailyItinerary, ItineraryItem } from '../types';
import './TravelMap.css';

interface TravelMapProps {
    itinerary: DailyItinerary[];
    selectedDay?: number;
    onMarkerClick?: (item: ItineraryItem) => void;
}

// 声明全局AMap类型
declare global {
    interface Window {
        AMap: any;
        _AMapSecurityConfig: any;
    }
}

const TravelMap: React.FC<TravelMapProps> = ({ itinerary, selectedDay, onMarkerClick }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // 校验经纬度有效性，避免传入 NaN 导致 AMap 报错
    const isValidLngLat = (lng?: any, lat?: any) => {
        const lngNum = typeof lng === 'string' ? Number(lng) : lng;
        const latNum = typeof lat === 'string' ? Number(lat) : lat;
        return (
            Number.isFinite(lngNum) &&
            Number.isFinite(latNum) &&
            lngNum >= -180 &&
            lngNum <= 180 &&
            latNum >= -90 &&
            latNum <= 90
        );
    };

    // 加载高德地图脚本
    useEffect(() => {
        const apiKey = import.meta.env.VITE_AMAP_KEY || '';

        if (!apiKey) {
            console.warn('高德地图API Key未配置');
            return;
        }

        // 设置安全密钥（如果需要）
        window._AMapSecurityConfig = {
            securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '',
        };

        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
        script.async = true;
        script.onload = () => {
            setMapLoaded(true);
        };
        script.onerror = () => {
            message.error('地图加载失败，请检查网络连接');
        };

        if (!document.querySelector(`script[src^="https://webapi.amap.com/maps"]`)) {
            document.head.appendChild(script);
        } else {
            setMapLoaded(true);
        }

        return () => {
            // 清理地图实例与监听器
            if (resizeObserverRef.current && mapRef.current) {
                try { resizeObserverRef.current.unobserve(mapRef.current); } catch { }
                try { resizeObserverRef.current.disconnect(); } catch { }
                resizeObserverRef.current = null;
            }
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.destroy(); } catch { }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // 初始化地图
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !window.AMap) return;

        const map = new window.AMap.Map(mapRef.current, {
            zoom: 12,
            center: [116.397428, 39.90923], // 默认北京
            viewMode: '3D',
            pitch: 30,
            skyColor: '#e6f7ff',
        });

        mapInstanceRef.current = map;

        // 等下一帧触发一次 resize，避免容器初始为 0 尺寸导致 Pixel(NaN, NaN)
        requestAnimationFrame(() => {
            try { map.resize(); } catch { }
        });

        // 监听容器尺寸变化，自动触发地图自适应
        if (mapRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserverRef.current = new ResizeObserver(() => {
                try { map.resize(); } catch { }
            });
            resizeObserverRef.current.observe(mapRef.current);
        }
    }, [mapLoaded]);

    // 更新地图标记
    useEffect(() => {
        if (!mapInstanceRef.current || !window.AMap) return;

        // 清除旧标记
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // 获取要显示的行程项
        let items: ItineraryItem[] = [];
        if (selectedDay !== undefined) {
            const dayItinerary = itinerary.find((d) => d.day === selectedDay);
            items = dayItinerary?.items.filter((item) => item.location) || [];
        } else {
            // 显示所有有位置的项
            items = itinerary.flatMap((day) =>
                day.items.filter((item) => item.location)
            );
        }

        // 过滤无效经纬度的数据，避免 LngLat(Pixel) NaN 报错
        const validItems = items.filter((item) =>
            item.location && isValidLngLat(item.location.lng, item.location.lat)
        );

        if (validItems.length === 0) return;

        // 添加标记
        validItems.forEach((item, index) => {
            if (!item.location) return;

            const lng = typeof item.location.lng === 'string' ? Number(item.location.lng) : item.location.lng;
            const lat = typeof item.location.lat === 'string' ? Number(item.location.lat) : item.location.lat;
            const position = [lng, lat];

            // 根据类型选择图标颜色
            const getMarkerColor = (type?: string) => {
                const colors: Record<string, string> = {
                    交通: '#1890ff',
                    住宿: '#52c41a',
                    餐饮: '#fa8c16',
                    景点: '#f5222d',
                    其他: '#8c8c8c',
                };
                return colors[type || '其他'] || '#667eea';
            };

            const marker = new window.AMap.Marker({
                position,
                title: item.title,
                label: {
                    content: `<div class="map-label">${index + 1}</div>`,
                    direction: 'top',
                },
                extData: item,
            });

            // 自定义标记样式
            const content = `
        <div class="custom-marker" style="background-color: ${getMarkerColor(item.type || item.item_type)}">
          <div class="marker-number">${index + 1}</div>
        </div>
      `;
            marker.setContent(content);

            // 点击事件
            marker.on('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(item);
                }
            });

            marker.setMap(mapInstanceRef.current);
            markersRef.current.push(marker);
        });

        // 调整视野以包含所有标记（使用 setFitView 更稳健）
        if (markersRef.current.length > 0) {
            try {
                mapInstanceRef.current.setFitView(markersRef.current, false, [80, 80, 80, 80]);
            } catch (e) {
                try { mapInstanceRef.current.resize(); } catch { }
            }
        }
    }, [itinerary, selectedDay, onMarkerClick]);

    return (
        <div className="travel-map-container">
            {!mapLoaded && (
                <div className="map-loading">
                    <div className="loading-spinner" />
                    <p>地图加载中...</p>
                </div>
            )}
            <div ref={mapRef} className="travel-map" />
        </div>
    );
};

export default TravelMap;
