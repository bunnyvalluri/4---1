# 🔄 Database Migrations & Versioning

## 1. Migration Strategy
CareerAI supports migration tracking through both Alembic (native to SQLAlchemy) and Prisma Schema (for hybrid environments).

---

## 2. Alembic Migration Commands
When modifying SQLAlchemy models in `backend/app/models/`:

```bash
# 1. Generate new migration script
alembic revision --autogenerate -m "add_column_to_profile"

# 2. Review generated file in alembic/versions/

# 3. Apply migration to database
alembic upgrade head

# 4. Rollback one revision if necessary
alembic downgrade -1
```

---

## 3. Zero-Downtime Migration Principles
1. **Expand and Contract**: Never rename or drop columns in a single release.
2. **Add Nullable Columns**: New columns must either be nullable or define an explicit server default.
3. **Index Creation**: Use `CREATE INDEX CONCURRENTLY` in PostgreSQL for production tables with high row counts.
