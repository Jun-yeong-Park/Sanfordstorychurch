#!/usr/bin/env bash
# 웹 미리보기용 (Expo web). iPhone 은 `npx expo start` → Expo Go 로 QR 스캔.
cd "$(dirname "$0")" || exit 1
exec npx expo start --web --port 8098
