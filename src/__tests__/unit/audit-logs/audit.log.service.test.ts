import { AuditLogRepository } from '../../../components/audit.logs/audit.logs.repository'
import { AuditLogService } from '../../../components/audit.logs/audit.logs.service'

describe('AuditLogService', () => {
  let findAll: jest.SpyInstance
  let findById: jest.SpyInstance
  let create: jest.SpyInstance

  beforeAll(() => {
    jest.clearAllMocks()
    findAll = jest.spyOn(AuditLogRepository, 'findAll')
    findById = jest.spyOn(AuditLogRepository, 'findById')
    create = jest.spyOn(AuditLogRepository, 'create')
  })

  describe('Create audit log', () => {
    it('should log action', async () => {
      create.mockResolvedValue({
        id: 1,
        userId: 1,
        resource: 'product',
        action: 'update',
        recordId: 1,
        changes: { price: [10, 20] },
        updatedAt: new Date('2025-10-20T06:27:23.072Z'),
        createdAt: new Date('2025-10-20T06:27:23.072Z'),
      })
      await AuditLogService.logAction({
        resource: 'product',
        action: 'update',
        recordId: 1,
        changes: { price: [10, 20] },
        userId: 1,
        ipAddress: '127.0.0.1',
        userAgent: 'mozilla',
      })
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ resource: 'product' }))
    })
  })

  describe('Get all audit logs', () => {
    it('should get logs with filters', async () => {
      findAll.mockResolvedValue({
        count: 1,
        rows: [
          {
            changes: { price: [10, 20] },
            user: [{ id: 1, name: 'admin', roleId: 1 }],
          },
        ],
      })
      const query = {
        action: 'create',
        fromDate: new Date('2025-10-18'),
        toDate: new Date(Date.now() + 1 * 60 * 60 * 1000),
        page: 1,
        limit: 20,
      } as any

      const res = await AuditLogService.getLogs(query)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ action: 'create' }))
    })
  })

  describe('Get an audit log', () => {
    it('should get audit by id', async () => {
      findById.mockResolvedValue({
        id: 1,
        userId: 1,
        resource: 'product',
        action: 'update',
        recordId: 1,
        changes: { price: [10, 20] },
        userAgent: null,
        ipAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 1, name: 'admin', roleId: 1 },
      })
      const res = await AuditLogService.getLogById(1)

      expect(res).toHaveProperty('action', 'update')
    })
  })
})
