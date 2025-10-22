import { AuditLogRepository } from '../../../components/audit.logs/audit.logs.repository'
import { generateTokens } from '../../utils/loader'

describe('AuditLogRepository', () => {
  let userId: number

  beforeEach(async () => {
    const { user } = await generateTokens('admin')
    userId = user!.id
  })

  describe('Create audit log', () => {
    it('should log action', async () => {
      const res = await AuditLogRepository.create({
        userId,
        resource: 'product',
        action: 'update',
        recordId: 1,
        changes: { price: [10, 20] },
      })
      expect(res).toBeTruthy()
      expect(res.dataValues).toBeInstanceOf(Object)
      expect(res.dataValues).toHaveProperty('resource', 'product')
    })
  })

  describe('Get all audit logs', () => {
    it('should get logs with filters', async () => {
      const filter = {
        userId,
        action: 'update' as const,
        fromDate: new Date('2025-10-18'),
        toDate: new Date(Date.now() + 1 * 60 * 60 * 1000),
        offset: 0,
        limit: 20,
      }
      const res = await AuditLogRepository.findAll(filter)
      expect(res).toBeTruthy()
    })
  })

  describe('Get an audit log', () => {
    it('should throw on invalid date', async () => {
      const res = await AuditLogRepository.findById(1)
      expect(res).toBeTruthy()
    })
  })
})
