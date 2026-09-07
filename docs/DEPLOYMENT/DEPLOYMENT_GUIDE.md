# 🚀 Deployment Architecture & Guide

CareerAI is container-native, designed to run statelessly across any modern cloud provider (AWS, GCP, DigitalOcean, Kubernetes) behind an Nginx / Cloudflare reverse proxy.

## 🧭 Deployment Directory
- [Production Setup](./PRODUCTION_SETUP.md) — Production host configuration, systemd, and TLS.
- [Docker & Containers](./DOCKER.md) — Multi-stage production container build instructions.
- [Database Deployment](./DATABASE_DEPLOYMENT.md) — PostgreSQL managed instances, pooling, and backups.
- [Environment Setup](./ENVIRONMENT_SETUP.md) — Secrets management and parameter stores.
- [CI/CD Pipeline](./CI_CD.md) — Automated GitHub Actions test and deployment workflows.
- [Monitoring & Metrics](./MONITORING.md) — Prometheus, Grafana, and latency observability.
- [Logging Architecture](./LOGGING.md) — Structured JSON logging and log aggregation.
- [Backup & Recovery](./BACKUP_AND_RECOVERY.md) — Disaster recovery, RPO/RTO, and pg_dump.
- [Rollback Strategy](./ROLLBACK.md) — Instant version rollback and database downgrade steps.
