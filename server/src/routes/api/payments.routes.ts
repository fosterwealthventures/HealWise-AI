import { Router } from 'express';
import { createCheckoutSessionHandler } from '../../controllers/payments.controller';

const router = Router();

router.post('/checkout-session', createCheckoutSessionHandler);

export default router;
