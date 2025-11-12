import { Router } from 'express';
import medsRoutes from './meds.routes';
import profileRoutes from './profile.routes';
import plannerRoutes from './planner.routes';
import recommendationRoutes from './recommendation.routes';
import geminiRoutes from './gemini.routes';
import paymentsRoutes from './payments.routes';

const router = Router();

router.use('/meds', medsRoutes);
router.use('/profile', profileRoutes);
router.use('/planner', plannerRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/gemini', geminiRoutes);
router.use('/payments', paymentsRoutes);

export default router;
