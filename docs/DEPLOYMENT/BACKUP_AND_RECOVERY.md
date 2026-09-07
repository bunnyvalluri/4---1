# 💾 Backup & Disaster Recovery

## 1. Automated Backups
Daily cron job runs `pg_dump`:
```bash
pg_dump $DATABASE_URL --format=custom --file=/backups/careerai_$(date +%Y%m%d).dump
```

## 2. Recovery Objectives
- **RPO (Recovery Point Objective)**: $< 24$ hours.
- **RTO (Recovery Time Objective)**: $< 30$ minutes.
