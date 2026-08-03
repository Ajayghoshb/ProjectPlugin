# Microsoft Graph Enterprise Permissions Matrix (`docs/teams-permissions.md`)

> **Application Name:** Think It (Microsoft Teams AI Meeting Intelligence Plugin)  
> **Azure AD Application ID:** `eec115d2-8418-4d66-8e18-b4283ffca2b1`

---

## Required Microsoft Graph Scopes

| Scope Name | Consent Type | Admin Consent Required | Purpose / Feature Enabled |
| :--- | :--- | :--- | :--- |
| `User.Read` | Delegated | No | Read current logged-in user profile, display name, and avatar |
| `Calendars.Read` | Delegated | No | Scan Outlook calendar events & schedule availability |
| `OnlineMeetings.Read` | Delegated | Yes | Read online meeting details & participant roster |
| `OnlineMeetingTranscript.Read.All` | Delegated | Yes | Read online meeting transcript audio streams & text lines |
| `Team.ReadBasic.All` | Delegated | No | Read basic Team list and channel metadata |

---

## Admin Consent Instructions

1. Log in to **Azure Active Directory Portal** (`portal.azure.com`).
2. Navigate to **App Registrations** ──► **Think It** ──► **API Permissions**.
3. Select **Grant admin consent for ThinkPalm Technologies**.
