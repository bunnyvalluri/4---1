# 📊 Firebase Telemetry & Monitoring

## 1. Telemetry Sources
- **Firebase Console Usage Dashboard**: Real-time read/write/delete operations per collection.
- **Google Cloud Monitoring**: Alerts on Firestore error rates ($5\text{xx}$) and elevated request latencies.
- **Storage Bandwidth**: Monitor monthly egress to prevent unexpected quotas.

## 2. Security Alerts
- Spikes in `PERMISSION_DENIED` status codes $\to$ Possible client tampering or security rule misconfiguration.
- Rapid user creation from single IP $\to$ Automated registration bot abuse (activate Firebase App Check).
