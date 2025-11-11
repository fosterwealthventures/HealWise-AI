import { Request, Response } from 'express';

export const getHealth = (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'healwise-api', ts: new Date().toISOString() });
};
