import { Router } from 'express';
import { mapController } from '../controllers/mapController';

const router = Router();

router.get('/search', mapController.searchPOI.bind(mapController));
router.get('/route', mapController.getRoute.bind(mapController));
router.get('/geocode', mapController.geocode.bind(mapController));

export default router;
