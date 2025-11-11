import { Router } from 'express';
import medsRoutes from './meds.routes';
import profileRoutes from './profile.routes';
import plannerRoutes from './planner.routes';
import recommendationRoutes from './recommendation.routes';

const router = Router();

router.use('/meds', medsRoutes);
router.use('/profile', profileRoutes);
router.use('/planner', plannerRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;
