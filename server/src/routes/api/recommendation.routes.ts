import { Router } from 'express';
import { createRecommendation } from '../../controllers/recommendation.controller';

const router = Router();

router.post('/', createRecommendation);

export default router;
