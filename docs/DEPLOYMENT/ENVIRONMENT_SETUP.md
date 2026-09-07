# 🔑 Production Environment Configuration

All production secrets should be managed via cloud secret managers (AWS Secrets Manager, Doppler, or GitHub Secrets):
- Never commit `.env` files to git.
- Ensure `ENVIRONMENT=production` and `DEBUG=False`.
- Rotate `SECRET_KEY` and API keys bi-annually.
