import { Router } from 'express';
import { createPlannerItem, getPlannerItems, removeAllPlannerItems, removePlannerItem } from '../../controllers/planner.controller';

const router = Router();

router.get('/', getPlannerItems);
router.post('/', createPlannerItem);
router.delete('/', removeAllPlannerItems);
router.delete('/:id', removePlannerItem);

export default router;
