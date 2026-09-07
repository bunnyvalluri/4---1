# 🗄️ Database Deployment & Managed PostgreSQL

## 1. Managed PostgreSQL Guidelines
- Use PostgreSQL 16+ on AWS RDS, Supabase, or Railway.
- Enable automatic daily backups and multi-AZ replication.
- Connect using SSL mode: `?ssl=require`.

## 2. Connection Limits
- Set connection limit according to Uvicorn worker count:
  $$\text{Total Connections} = (\text{Workers} \times \text{Pool Size}) + 5$$
