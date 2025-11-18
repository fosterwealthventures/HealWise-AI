import { Router } from 'express';
import { createBillingPortalSessionHandler, createCheckoutSessionHandler } from '../../controllers/payments.controller';

const router = Router();

router.post('/checkout-session', createCheckoutSessionHandler);
router.post('/portal-session', createBillingPortalSessionHandler);

export default router;
