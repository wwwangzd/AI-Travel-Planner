import React, { useEffect, useRef, useState } from 'react';
import { message, Segmented, Button } from 'antd';
import type { DailyItinerary, ItineraryItem } from '../types';
import { mapApi } from '../api/map';
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
    const routePolylineRef = useRef<any | null>(null);
    const selectedPointsRef = useRef<{ lng: number; lat: number; title?: string }[]>([]);
    const [navMode, setNavMode] = useState<'walking' | 'transit' | 'driving'>('walking');
    const [selecting, setSelecting] = useState<0 | 1 | 2>(0); // 0:未选,1:已选起点,2:已选起点终点
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
        const apiKey = import.meta.env.VITE_AMAP_KEY;

        // 设置安全密钥（如果需要）
        window._AMapSecurityConfig = {
            securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
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

        // 清除旧路线与选点
        if (routePolylineRef.current) {
            try { routePolylineRef.current.setMap(null); } catch { }
            routePolylineRef.current = null;
        }
        selectedPointsRef.current = [];
        setSelecting(0);

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
            marker.on('click', async () => {
                if (onMarkerClick) {
                    onMarkerClick(item);
                }

                // 导航选点：先选起点，再选终点
                const point = { lng, lat, title: item.title };
                const curr = selectedPointsRef.current;
                if (curr.length < 1) {
                    selectedPointsRef.current = [point];
                    setSelecting(1);
                    message.info(`已选择起点：${item.title}`);
                } else if (curr.length === 1) {
                    const last = curr[0];
                    if (last.lng === point.lng && last.lat === point.lat) return;
                    selectedPointsRef.current = [last, point];
                    setSelecting(2);
                    await drawRoute();
                } else {
                    // 已有两点，则将第二点作为新起点
                    selectedPointsRef.current = [curr[1], point];
                    setSelecting(2);
                    await drawRoute();
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

    // 绘制路线（使用后端聚合后的 data.route.polyline）
    const drawRoute = async () => {
        if (!mapInstanceRef.current) return;
        const pts = selectedPointsRef.current;
        if (pts.length < 2) return;
        const [start, end] = pts;

        try {
            const origin = `${start.lng},${start.lat}`; // lng,lat 顺序
            const destination = `${end.lng},${end.lat}`;
            const resp = await mapApi.getRoute({ origin, destination, mode: navMode });

            if (!resp.success || !resp.data || !(resp.data as any).route) {
                message.error('路线规划失败');
                return;
            }
            const route = (resp.data as any).route;
            const polylineStr: string | undefined = route.polyline;
            if (!polylineStr) {
                message.warning('未获取到有效路线');
                return;
            }

            const path = polylineStr
                .split(';')
                .map((p: string) => p.split(',').map(Number))
                .filter((arr: number[]) => arr.length === 2 && arr.every(Number.isFinite));
            if (!path.length) {
                message.warning('未获取到有效路线');
                return;
            }

            // 清除旧路线
            if (routePolylineRef.current) {
                try { routePolylineRef.current.setMap(null); } catch { }
                routePolylineRef.current = null;
            }

            // 绘制新路线
            const polyline = new window.AMap.Polyline({
                path: path.map(([lng, lat]: number[]) => [lng, lat]),
                strokeColor: '#667eea',
                strokeWeight: 5,
                strokeOpacity: 0.9,
            });
            polyline.setMap(mapInstanceRef.current);
            routePolylineRef.current = polyline;

            try {
                mapInstanceRef.current.setFitView([polyline], false, [80, 80, 80, 80]);
            } catch { }

            // 绘制完成后自动清空起止点选择，保留已绘制的路线
            selectedPointsRef.current = [];
            setSelecting(0);
            message.success('已绘制路线，起止点已清空');
        } catch (e) {
            console.error('drawRoute error', e);
            message.error('路线规划请求失败');
        }
    };

    // 切换模式时，若已选两点则重绘
    useEffect(() => {
        if (selecting === 2) {
            drawRoute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navMode]);

    return (
        <div className="travel-map-container">
            {!mapLoaded && (
                <div className="map-loading">
                    <div className="loading-spinner" />
                    <p>地图加载中...</p>
                </div>
            )}
            <div ref={mapRef} className="travel-map" />
            {/* 导航控制面板 */}
            <div className="map-controls">
                <div className="mode-switch">
                    <Segmented
                        size="small"
                        value={navMode}
                        onChange={(val) => setNavMode(val as any)}
                        options={[
                            { label: '步行', value: 'walking' },
                            { label: '公交', value: 'transit' },
                            { label: '驾车', value: 'driving' },
                        ]}
                    />
                </div>
                <div className="selection-hint">
                    {selecting === 0 && <span>点击地图标记选择起点</span>}
                    {selecting === 1 && <span>已选起点，点击另一标记选择终点</span>}
                    {selecting === 2 && <span>已绘制起终点路线</span>}
                </div>
                <div>
                    <Button size="small" onClick={() => {
                        selectedPointsRef.current = [];
                        setSelecting(0);
                        if (routePolylineRef.current) {
                            try { routePolylineRef.current.setMap(null); } catch { }
                            routePolylineRef.current = null;
                        }
                        message.success('已清空路线');
                    }}>清空路线</Button>
                </div>
            </div>
        </div>
    );
};

export default TravelMap;
