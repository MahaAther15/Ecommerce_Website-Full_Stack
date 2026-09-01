/**
 * Centralized API Base URL configuration.
 * Automatically strips trailing "/api" or slashes to prevent duplicate "/api/api" routing issues.
 * Defaults to the production backend on MonsterASP / RunASP.
 */
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "https://cara-ecommerce.runasp.net";

export const API_BASE_URL = RAW_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
