# 🔧 Scheduled Maintenance Procedures

1. **PostgreSQL Vacuuming**: Automated weekly `VACUUM ANALYZE` on high-churn tables (`resume_analyses`, `chat_messages`).
2. **TLS Certificate Renewal**: Let's Encrypt automated certbot renewal checks on the 1st of every month.
3. **Database Re-indexing**: Rebuild indexes annually or when tables exceed 1M rows.
