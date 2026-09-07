# 📝 Structured Logging

Configured in `backend/app/core/logging.py`:
- Emits structured JSON logs containing timestamp, log level, module, message, and request ID.
- Seamlessly ingestible by Datadog, Grafana Loki, or AWS CloudWatch.
