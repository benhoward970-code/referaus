# Database Optimization Skill

**Purpose:** Make database queries blazing fast  
**Impact:** 10-100x performance improvements

---

## Quick Wins

### 1. Add Indexes
```sql
-- Identify slow queries first
EXPLAIN ANALYZE SELECT * FROM participants WHERE ndisNumber = '123456789';

-- Add index on frequently queried columns
CREATE INDEX idx_participants_ndis ON participants(ndisNumber);
CREATE INDEX idx_plans_status ON plans(planStatus);
CREATE INDEX idx_transactions_date ON transactions(transactionDate);

-- Composite indexes for multi-column queries
CREATE INDEX idx_participant_plan 
ON participants(participantId, planStatus, currentPlanEndDate);
```

### 2. Query Optimization
```typescript
// ❌ BAD: N+1 Query Problem
const participants = await participantRepo.find();
for (const p of participants) {
  const plans = await planRepo.findBy({ participantId: p.id });
  // 1 query + N queries = SLOW
}

// ✅ GOOD: Single query with relations
const participants = await participantRepo.find({
  relations: ['plans', 'goals', 'caseNotes'],
  where: { status: 'Active' }
});
// 1 query = FAST
```

### 3. Pagination
```typescript
// ❌ BAD: Load everything
const allParticipants = await repo.find(); // Could be 10,000 records!

// ✅ GOOD: Paginate
const participants = await repo.find({
  skip: (page - 1) * limit,
  take: limit,
  order: { createdAt: 'DESC' }
});
```

---

## TypeORM Optimization

### Selective Loading
```typescript
// ❌ Don't load everything
const participant = await repo.findOne({
  where: { id },
  relations: ['plans', 'goals', 'caseNotes', 'documents', 'transactions']
  // Loads thousands of records!
});

// ✅ Load only what you need
const participant = await repo.findOne({
  where: { id },
  select: ['id', 'firstName', 'lastName', 'ndisNumber'],
  relations: ['plans']
});
```

### Query Builder for Complex Queries
```typescript
const results = await repo.createQueryBuilder('participant')
  .leftJoinAndSelect('participant.plans', 'plan')
  .where('plan.planStatus = :status', { status: 'Active' })
  .andWhere('plan.currentPlanEndDate < :date', { 
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
  })
  .select([
    'participant.id',
    'participant.firstName',
    'participant.lastName',
    'plan.planStatus',
    'plan.currentPlanEndDate'
  ])
  .getMany();
```

---

## Connection Pooling

### Configure Pool Size
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'ndis',
  extra: {
    max: 20,              // Max connections in pool
    min: 5,               // Min connections maintained
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
```

---

## Caching Strategies

### 1. Query Result Cache
```typescript
const participants = await repo.find({
  where: { status: 'Active' },
  cache: {
    id: 'active_participants',
    milliseconds: 60000  // Cache for 1 minute
  }
});
```

### 2. Redis Cache
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ParticipantsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private repo: Repository<Participant>
  ) {}

  async findAll() {
    const cacheKey = 'participants_all';
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Not cached, query DB
    const data = await this.repo.find();
    
    // Store in cache
    await this.cache.set(cacheKey, data, 300000); // 5 min TTL
    
    return data;
  }
}
```

---

## Database Monitoring

### Log Slow Queries
```typescript
// TypeORM config
{
  logging: true,
  maxQueryExecutionTime: 1000, // Log queries taking >1s
  logger: 'advanced-console'
}
```

### Query Performance Analysis
```sql
-- PostgreSQL: Find slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- SQLite: Enable query profiling
PRAGMA query_profiler = ON;
```

---

## Index Strategy

### When to Add Indexes

**Add indexes on:**
- Primary keys (automatic)
- Foreign keys
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY
- Unique constraints

**Don't over-index:**
- Write-heavy tables (indexes slow writes)
- Small tables (<1000 rows)
- Columns with low cardinality (e.g., boolean)

### Example Index Setup
```typescript
@Entity()
@Index(['ndisNumber'], { unique: true })
@Index(['planStatus', 'currentPlanEndDate'])
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  ndisNumber: string;

  @Column()
  @Index()
  planStatus: string;

  @Column()
  @Index()
  currentPlanEndDate: Date;
}
```

---

## Bulk Operations

### Batch Inserts
```typescript
// ❌ BAD: One at a time
for (const participant of participants) {
  await repo.save(participant);
  // N database round-trips
}

// ✅ GOOD: Batch insert
await repo.save(participants);
// Single transaction
```

### Batch Updates
```typescript
// Update multiple records efficiently
await repo.update(
  { planStatus: 'Expiring' },
  { planStatus: 'Expired' }
);
```

---

## Transaction Management

### Use Transactions for Multiple Operations
```typescript
await this.dataSource.transaction(async (manager) => {
  // All or nothing
  await manager.save(Participant, participant);
  await manager.save(Plan, plan);
  await manager.save(Goal, goals);
  // If any fails, all rollback
});
```

---

## Database Cleanup

### Archive Old Data
```typescript
// Move old records to archive table
async archiveOldTransactions() {
  const cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  const oldTransactions = await this.transactionRepo.find({
    where: { transactionDate: LessThan(cutoffDate) }
  });
  
  // Save to archive
  await this.archiveRepo.save(oldTransactions);
  
  // Delete from main table
  await this.transactionRepo.remove(oldTransactions);
}
```

### Vacuum & Optimize
```sql
-- PostgreSQL
VACUUM ANALYZE;

-- SQLite
VACUUM;
ANALYZE;
```

---

## Performance Checklist

### Before Launch
- [ ] All foreign keys indexed
- [ ] Queries use proper WHERE clauses
- [ ] No N+1 query problems
- [ ] Pagination on large datasets
- [ ] Connection pooling configured
- [ ] Slow query logging enabled
- [ ] Explain plan reviewed for main queries

### Monthly Maintenance
- [ ] Review slow query log
- [ ] Check index usage
- [ ] Analyze query plans
- [ ] Vacuum/optimize database
- [ ] Review cache hit rates
- [ ] Archive old data

---

## Quick Benchmark

```bash
# Test query performance
time psql -d ndis -c "SELECT * FROM participants WHERE ndisNumber = '123456789';"

# Before index: ~500ms
# After index: ~5ms
# 100x improvement!
```

---

**Fast databases = happy users** ⚡🗄️

---

_Database Optimization Skill by CLAWDY - 12 Feb 2026_
