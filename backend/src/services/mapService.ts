import axios from 'axios';

export class AmapService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.AMAP_KEY!;

        if (!this.apiKey) {
            throw new Error('AMAP_KEY is not set');
        }
    }

    async searchPOI(keyword: string, city?: string): Promise<any[]> {
        try {
            const params: any = {
                key: this.apiKey,
                keywords: keyword,
                output: 'json'
            };

            if (city) {
                params.city = city;
            }

            const response = await axios.get('https://restapi.amap.com/v3/place/text', {
                params
            });

            if (response.data.status !== '1') {
                throw new Error(`Amap API Error: ${response.data.info}`);
            }

            return response.data.pois.map((poi: any) => ({
                name: poi.name,
                address: poi.address,
                location: {
                    lat: parseFloat(poi.location.split(',')[1]),
                    lng: parseFloat(poi.location.split(',')[0])
                },
                type: poi.type,
                tel: poi.tel,
                cityname: poi.cityname
            }));
        } catch (error: any) {
            console.error('Amap POI Search Error:', error.message);
            throw new Error('Failed to search POI');
        }
    }

    async getRoute(
        origin: string,
        destination: string,
        mode: 'walking' | 'transit' | 'driving' = 'transit'
    ): Promise<any> {
        try {
            let endpoint = '';
            if (mode === 'walking') {
                endpoint = 'https://restapi.amap.com/v3/direction/walking';
            } else if (mode === 'transit') {
                endpoint = 'https://restapi.amap.com/v3/direction/transit/integrated';
            } else {
                endpoint = 'https://restapi.amap.com/v3/direction/driving';
            }

            const response = await axios.get(endpoint, {
                params: {
                    key: this.apiKey,
                    origin,
                    destination,
                    output: 'json'
                }
            });

            if (response.data.status !== '1') {
                throw new Error(`Amap API Error: ${response.data.info}`);
            }

            // 解析返回数据
            const route = response.data.route;
            if (!route) {
                return null;
            }

            // driving / walking: 使用 route.paths[0]
            if (mode === 'driving' || mode === 'walking') {
                const paths = route.paths;
                if (!paths || paths.length === 0) return null;
                const firstPath = paths[0];

                // 有些情况下 path.polyline 不存在，需从 steps 聚合
                let mergedPolyline = '';
                if (Array.isArray(firstPath.steps) && firstPath.steps.length > 0) {
                    const parts: string[] = [];
                    for (const s of firstPath.steps) {
                        if (s.polyline) parts.push(s.polyline);
                    }
                    mergedPolyline = parts.join(';');
                }

                return {
                    distance: firstPath.distance,
                    duration: firstPath.duration,
                    steps: firstPath.steps || [],
                    polyline: firstPath.polyline || mergedPolyline || ''
                };
            }

            // transit: 使用 route.transits[0].segments，拼接步行与公交等折线
            const transits = route.transits;
            if (!transits || transits.length === 0) return null;
            const firstTransit = transits[0];
            const segments = firstTransit.segments || [];

            const parts: string[] = [];
            for (const seg of segments) {
                // 步行部分
                if (seg.walking && Array.isArray(seg.walking.steps)) {
                    for (const st of seg.walking.steps) {
                        if (st.polyline) parts.push(st.polyline);
                    }
                }
                // 公交部分
                if (seg.bus && Array.isArray(seg.bus.buslines)) {
                    for (const line of seg.bus.buslines) {
                        if (line.polyline) parts.push(line.polyline);
                    }
                }
                // 地铁/铁路等（若有 polyline）
                if (seg.railway && seg.railway.polyline) {
                    parts.push(seg.railway.polyline);
                }
            }

            const mergedPolyline = parts.join(';');

            return {
                distance: firstTransit.distance,
                duration: firstTransit.duration,
                steps: segments, // 前端如需更细可使用 segments
                polyline: mergedPolyline || ''
            };
        } catch (error: any) {
            console.error('Amap Route Error:', error.message);
            throw new Error('Failed to get route');
        }
    }

    async geocode(address: string, city?: string): Promise<any> {
        try {
            const params: any = {
                key: this.apiKey,
                address,
                output: 'json'
            };

            if (city) {
                params.city = city;
            }

            const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
                params
            });

            if (response.data.status !== '1' || response.data.geocodes.length === 0) {
                throw new Error('Address not found');
            }

            const geocode = response.data.geocodes[0];
            const [lng, lat] = geocode.location.split(',').map(parseFloat);

            return {
                address: geocode.formatted_address,
                location: { lat, lng },
                province: geocode.province,
                city: geocode.city,
                district: geocode.district
            };
        } catch (error: any) {
            console.error('Amap Geocode Error:', error.message);
            throw new Error('Failed to geocode address');
        }
    }
}

export const amapService = new AmapService();
