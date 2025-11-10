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
    const [mapReady, setMapReady] = useState(false); // 地图完全初始化完成
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

        // 设置安全密钥
        window._AMapSecurityConfig = {
            securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
        };

        // 检查AMap是否已加载
        if (window.AMap) {
            setMapLoaded(true);
            return;
        }

        const existingScript = document.querySelector(`script[src^="https://webapi.amap.com/maps"]`);

        if (existingScript) {
            // 脚本标签存在但可能还在加载中，轮询检查window.AMap
            const checkInterval = setInterval(() => {
                if (window.AMap) {
                    setMapLoaded(true);
                    clearInterval(checkInterval);
                }
            }, 100);

            // 超时保护：10秒后停止检查
            const timeout = setTimeout(() => {
                clearInterval(checkInterval);
                if (!window.AMap) {
                    message.error('地图加载超时');
                }
            }, 10000);

            return () => {
                clearInterval(checkInterval);
                clearTimeout(timeout);
            };
        } else {
            // 创建并加载地图脚本
            const script = document.createElement('script');
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
            script.async = true;
            script.onload = () => setMapLoaded(true);
            script.onerror = () => message.error('地图加载失败，请检查网络连接');
            document.head.appendChild(script);
        }

        return () => {
            // 组件卸载时清理地图实例
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.destroy();
                } catch (e) {
                    console.error('Map destroy error:', e);
                }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // 初始化地图
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !window.AMap || mapInstanceRef.current) {
            return;
        }

        const map = new window.AMap.Map(mapRef.current, {
            zoom: 12,
            center: [116.397428, 39.90923],
            viewMode: '3D',
            pitch: 30,
            skyColor: '#e6f7ff',
            resizeEnable: true,
        });

        mapInstanceRef.current = map;

        // 地图加载完成后自动调整大小并标记为就绪
        map.on('complete', () => {
            try {
                map.resize();
                setMapReady(true); // 地图初始化完成，可以添加标记了
            } catch (e) {
                console.error('Map resize error:', e);
            }
        });

        // 监听容器尺寸变化
        if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
            resizeObserverRef.current = new ResizeObserver(() => {
                if (mapInstanceRef.current) {
                    try {
                        mapInstanceRef.current.resize();
                    } catch (e) {
                        console.error('Map resize error:', e);
                    }
                }
            });
            resizeObserverRef.current.observe(mapRef.current);
        }

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [mapLoaded]);

    // 更新地图标记
    useEffect(() => {
        if (!mapInstanceRef.current || !window.AMap || !mapReady) return;

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

        // 标记颜色映射
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

        // 按位置分组，处理重复经纬度
        const locationGroups = new Map<string, { items: ItineraryItem[]; indices: number[] }>();
        validItems.forEach((item, index) => {
            if (!item.location) return;
            const lng = typeof item.location.lng === 'string' ? Number(item.location.lng) : item.location.lng;
            const lat = typeof item.location.lat === 'string' ? Number(item.location.lat) : item.location.lat;
            const key = `${lng.toFixed(6)},${lat.toFixed(6)}`; // 精确到6位小数

            if (!locationGroups.has(key)) {
                locationGroups.set(key, { items: [], indices: [] });
            }
            locationGroups.get(key)!.items.push(item);
            locationGroups.get(key)!.indices.push(index + 1);
        });

        // 为每个位置组添加标记
        locationGroups.forEach((group, locationKey) => {
            const [lngStr, latStr] = locationKey.split(',');
            const lng = Number(lngStr);
            const lat = Number(latStr);
            const position = [lng, lat];

            const firstItem = group.items[0];
            const allTitles = group.items.map(item => item.title).join(', ');
            const indices = group.indices;

            const marker = new window.AMap.Marker({
                position,
                title: allTitles,
                label: {
                    content: `<div class="map-label">${indices.join(',')}</div>`,
                    direction: 'top',
                },
                extData: { items: group.items, indices },
            });

            // 自定义标记样式
            const markerColor = getMarkerColor(firstItem.type || firstItem.item_type);
            const numberDisplay = indices.length > 1 ? indices.join(',') : indices[0];
            const content = `
                <div class="custom-marker ${indices.length > 1 ? 'multi-marker' : ''}" style="background-color: ${markerColor}">
                    <div class="marker-number">${numberDisplay}</div>
                </div>
            `;
            marker.setContent(content);

            // 标记点击事件处理
            marker.on('click', async () => {
                // 如果有多个项目，只通知第一个（或者可以根据需求调整）
                if (group.items.length > 1) {
                    onMarkerClick?.(firstItem);
                    message.info(`该位置有${group.items.length}个项目：${allTitles}`);
                } else {
                    onMarkerClick?.(firstItem);
                }

                // 导航路线选点逻辑
                const point = { lng, lat, title: allTitles };
                const currentPoints = selectedPointsRef.current;

                if (currentPoints.length === 0) {
                    // 选择起点
                    selectedPointsRef.current = [point];
                    setSelecting(1);
                    message.info(`已选择起点：${allTitles}`);
                } else if (currentPoints.length === 1) {
                    // 选择终点
                    const [startPoint] = currentPoints;
                    if (startPoint.lng === lng && startPoint.lat === lat) return; // 同一个点
                    selectedPointsRef.current = [startPoint, point];
                    setSelecting(2);
                    await drawRoute();
                } else {
                    // 已有起点和终点，将当前终点设为新起点
                    selectedPointsRef.current = [currentPoints[1], point];
                    setSelecting(2);
                    await drawRoute();
                }
            });

            marker.setMap(mapInstanceRef.current);
            markersRef.current.push(marker);
        });

        // 自动调整视野以包含所有标记
        if (markersRef.current.length > 0) {
            try {
                mapInstanceRef.current.setFitView(markersRef.current, false, [80, 80, 80, 80]);
            } catch (e) {
                console.error('SetFitView error:', e);
            }
        }
    }, [itinerary, selectedDay, mapReady]);

    // 绘制路线
    const drawRoute = async () => {
        if (!mapInstanceRef.current) return;

        const points = selectedPointsRef.current;
        if (points.length < 2) return;

        const [start, end] = points;

        try {
            const origin = `${start.lng},${start.lat}`;
            const destination = `${end.lng},${end.lat}`;
            const response = await mapApi.getRoute({ origin, destination, mode: navMode });

            if (!response.success || !response.data || !(response.data as any).route) {
                message.error('路线规划失败');
                return;
            }

            const route = (response.data as any).route;
            const polylineStr = route.polyline;

            if (!polylineStr) {
                message.warning('未获取到有效路线');
                return;
            }

            // 解析路线坐标
            const path = polylineStr
                .split(';')
                .map((point: string) => point.split(',').map(Number))
                .filter((coords: number[]) => coords.length === 2 && coords.every(Number.isFinite));

            if (path.length === 0) {
                message.warning('未获取到有效路线');
                return;
            }

            // 清除旧路线
            if (routePolylineRef.current) {
                routePolylineRef.current.setMap(null);
                routePolylineRef.current = null;
            }

            // 绘制新路线
            const polyline = new window.AMap.Polyline({
                path,
                strokeColor: '#667eea',
                strokeWeight: 5,
                strokeOpacity: 0.9,
            });
            polyline.setMap(mapInstanceRef.current);
            routePolylineRef.current = polyline;

            // 调整视野以显示完整路线
            try {
                mapInstanceRef.current.setFitView([polyline], false, [80, 80, 80, 80]);
            } catch (e) {
                console.error('SetFitView error:', e);
            }

            // 清空起止点选择状态
            selectedPointsRef.current = [];
            setSelecting(0);
            message.success('路线绘制完成');
        } catch (error) {
            console.error('Route drawing error:', error);
            message.error('路线规划请求失败');
        }
    };

    // 切换导航模式时重新绘制路线
    useEffect(() => {
        if (selecting === 2 && selectedPointsRef.current.length === 2) {
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
                <Button
                    size="small"
                    onClick={() => {
                        selectedPointsRef.current = [];
                        setSelecting(0);
                        if (routePolylineRef.current) {
                            routePolylineRef.current.setMap(null);
                            routePolylineRef.current = null;
                        }
                        message.success('已清空路线');
                    }}
                >
                    清空路线
                </Button>
            </div>
        </div>
    );
};

export default TravelMap;
