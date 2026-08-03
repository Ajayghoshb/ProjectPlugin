# Think It - Microsoft Teams Application Package (`teams-app/`)

> **Package Name:** `ThinkIt.zip`  
> **Schema Version:** `v1.15`  
> **Target Client:** Microsoft Teams (Desktop, Mobile, Web)

---

## 1. Package File Contents

```
teams-app/
├── manifest.json                  # Production Teams App Manifest (Schema v1.15)
├── icons/
│   ├── color.png                  # 192x192 PNG Brand Logo Icon
│   └── outline.png                # 32x32 PNG Monochromatic Outline Icon
└── README.md                      # Upload & Validation Documentation
```

---

## 2. Dynamic Package Download Endpoint

Organisational Administrators can compile and download the live ZIP app package directly from the backend server:

```http
GET /api/teams/package/download
```

Returns `ThinkIt.zip` ready for upload into the **Microsoft Teams Admin Center** (`admin.teams.microsoft.com`).
