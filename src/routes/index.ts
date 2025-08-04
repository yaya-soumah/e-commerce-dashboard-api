import { Router, Response } from 'express'

const router = Router()

router.get('/', (_, res: Response) => {
  res.send('ok')
})

export default router
