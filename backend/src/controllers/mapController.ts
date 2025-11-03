import { Request, Response } from 'express';
import { amapService } from '../services/mapService';

export class MapController {
    async searchPOI(req: Request, res: Response) {
        try {
            const { keyword, city } = req.query;

            if (!keyword) {
                return res.status(400).json({
                    success: false,
                    error: 'Keyword is required'
                });
            }

            const pois = await amapService.searchPOI(
                keyword as string,
                city as string | undefined
            );

            res.json({
                success: true,
                data: { pois }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to search POI'
            });
        }
    }

    async getRoute(req: Request, res: Response) {
        try {
            const { origin, destination, mode } = req.query;

            if (!origin || !destination) {
                return res.status(400).json({
                    success: false,
                    error: 'Origin and destination are required'
                });
            }

            const validModes = ['walking', 'transit', 'driving'];
            const travelMode = validModes.includes(mode as string)
                ? (mode as 'walking' | 'transit' | 'driving')
                : 'transit';

            const route = await amapService.getRoute(
                origin as string,
                destination as string,
                travelMode
            );

            res.json({
                success: true,
                data: { route }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get route'
            });
        }
    }

    async geocode(req: Request, res: Response) {
        try {
            const { address, city } = req.query;

            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Address is required'
                });
            }

            const result = await amapService.geocode(
                address as string,
                city as string | undefined
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to geocode address'
            });
        }
    }
}

export const mapController = new MapController();
