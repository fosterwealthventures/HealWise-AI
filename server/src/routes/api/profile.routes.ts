import { Router } from 'express';
import { changePlan, fetchProfile, writeProfile } from '../../controllers/profile.controller';

const router = Router();

router.get('/', fetchProfile);
router.put('/', writeProfile);
router.post('/plan', changePlan);

export default router;
