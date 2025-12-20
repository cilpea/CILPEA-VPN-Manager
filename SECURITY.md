# Security Policy

## Supported Versions

The following versions of CILPEA VPN Manager are currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of CILPEA VPN Manager seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

### Disclosure Process

1.  **Report**: Send an email to `security@cilpea.com` or use our encrypted portal.
2.  **Acknowledgment**: You will receive an acknowledgment of your report within 48 hours.
3.  **Evaluation**: Our team will evaluate the severity and impact of the reported issue.
4.  **Fix**: We aim to provide a patch for critical vulnerabilities within 7 business days.
5.  **Release**: A new version will be released, and credit will be given to the researcher (if desired).

### Scope

This policy applies to:
- The React Dashboard UI.
- The Gemini-integrated CVE Scanner module.
- The underlying VPN orchestration logic.

## Security Features in CILPEA

- **Gemini-Powered Audits**: We integrate `gemini-1.5-flash` to provide real-time CVE scanning and security recommendations.
- **AES-256-GCM Encryption**: All tunnels utilize industry-standard Galois/Counter Mode encryption.
- **Automatic Reconnection**: Mitigates potential data leaks during tunnel instability.
- **Terminal Isolation**: Logs are sanitized to prevent sensitive credential exposure in the UI.

## Best Practices

To ensure your VPN environment remains secure:
- Always use the latest version of OpenVPN (2.6.x+).
- Regularly rotate your `.ovpn` configuration keys.
- Run a "Security Audit" via the dashboard after any infrastructure changes.
