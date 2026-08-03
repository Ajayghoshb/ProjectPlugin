# Microsoft Teams Admin Deployment Guide (`docs/teams-deployment.md`)

> **Application:** Think It - AI Meeting Intelligence & Enterprise Memory  
> **Package:** `ThinkIt.zip` (Manifest v1.15 Schema)

---

## 1. Organization Admin Flow (Microsoft Teams Admin Center)

```
[ Organization Administrator ]
              │
              ▼
[ Microsoft Teams Admin Center ] (admin.teams.microsoft.com)
              │
              ▼
[ Manage Apps ] ──► [ Upload Custom App ]
              │
              ▼
    [ Upload ThinkIt.zip ]
              │
              ▼
 [ Grant Admin Consent for Entra ID ]
              │
              ▼
[ Publish to Organizational App Store ]
```

### Admin Deployment Steps
1. Download `ThinkIt.zip` package from `/api/teams/package/download`.
2. Open **Microsoft Teams Admin Center** (`admin.teams.microsoft.com`).
3. Select **Teams Apps** ──► **Manage Apps**.
4. Click **Upload new app** ──► **Upload** and select `ThinkIt.zip`.
5. Under **Permissions**, click **Review permissions and grant consent**.
6. Set app status to **Allowed** for all organization users.

---

## 2. Employee Installation Flow

```
[ Employee User ] ──► [ Microsoft Teams Apps Store ] ──► [ Select 'Think It' ] ──► [ Click Add / Install ] ──► [ Entra ID SSO Auto-Login ] ──► [ Collection Workspace Opens ]
```
