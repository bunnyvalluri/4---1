# 💾 Firebase Backup & Disaster Recovery

## 1. Cloud Firestore Automated Backups
1. **Scheduled Daily Export**: Configure Cloud Scheduler and Cloud Functions to invoke `gcloud firestore export`:
   ```bash
   gcloud firestore export gs://careerai-production-backups/$(date +%Y-%m-%d)
   ```
2. **Retention Policy**: Retain daily snapshots for 30 days; monthly snapshots for 1 year in Nearline / Coldline storage.

---

## 2. Disaster Recovery Procedure
To restore a snapshot into a new or recovered Firestore database:
```bash
gcloud firestore import gs://careerai-production-backups/2026-03-01/
```

- **RPO (Recovery Point Objective)**: $< 24$ hours.
- **RTO (Recovery Time Objective)**: $< 45$ minutes.
