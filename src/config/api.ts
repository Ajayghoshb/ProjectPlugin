// Centralized API Base URL Configuration for Development & Production Deployments
export const API_URL = (
  (import.meta as any).env?.VITE_API_URL || "https://projectplugin-api.onrender.com"
).replace(/\/+$/, "");
