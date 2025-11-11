import { Router } from 'express';
import { simplifyMeds } from '../../controllers/meds.controller';

const router = Router();

router.post('/simplify', simplifyMeds);

export default router;
