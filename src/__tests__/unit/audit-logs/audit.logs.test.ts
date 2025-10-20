import { AuditLogService } from '../services/AuditLogService'
import { AuditLogRepository } from '../repositories/AuditLogRepository'
// Mock repo, sequelize

describe('AuditLogService', () => {
  let service: AuditLogService
  let mockRepo: jest.Mocked<AuditLogRepository>

  beforeEach(() => {
    mockRepo = { findAll: jest.fn(), findById: jest.fn(), create: jest.fn() } as any
    service = new AuditLogService(mockRepo)
  })

  it('should log action', async () => {
    await service.logAction({
      resource: 'product',
      action: 'update',
      recordId: 1,
      changes: { price: [10, 20] },
    })
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ resource: 'product' }))
  })

  it('should get logs with filters', async () => {
    mockRepo.findAll.mockResolvedValue({ logs: [], total: 0 })
    const req = { query: { action: 'create', fromDate: '2025-10-01' } } as any
    const result = await service.getLogs(req)
    expect(result.data.logs).toEqual([])
    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({ action: 'create' }))
  })

  it('should throw on invalid date', async () => {
    const req = { query: { fromDate: 'invalid' } } as any
    await expect(service.getLogs(req)).rejects.toThrow('Invalid fromDate')
  })

  // Hook test: Separate, mock model.create, assert AuditLog.create called
  // Integration: Create product as user, assert log created with correct changes
  // Unauthorized: Mock middleware, expect 403
  // Edge: Deleted user → 'Deleted User' in response
})
