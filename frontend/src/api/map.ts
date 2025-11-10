import request from '../utils/request';
import type { ApiResponse, POI, MapLocation } from '../types';

export interface SearchParams {
    keyword: string;
    city?: string;
}

export interface RouteParams {
    origin: string;
    destination: string;
    mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

export interface GeocodeParams {
    address: string;
    city?: string;
}

export interface GeocodeResult {
    address: string;
    location: MapLocation;
    province?: string;
    city?: string;
    district?: string;
}

export interface RouteResult {
    distance: number;
    duration: number;
    steps: any[];
    polyline: string;
}

export const mapApi = {
    // 搜索地点
    search: (params: SearchParams) =>
        request.get<any, ApiResponse<{ pois: POI[] }>>('/api/map/search', { params }),

    // 规划路线
    getRoute: (params: RouteParams) =>
        request.get<any, ApiResponse<{ route: RouteResult }>>('/api/map/route', { params }),

    // 地理编码
    geocode: (params: GeocodeParams) =>
        request.get<any, ApiResponse<GeocodeResult>>('/api/map/geocode', { params }),
};
