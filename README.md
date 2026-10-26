# CrossForge 🎯

<div align="center">

![CrossForge Banner](docs/screenshot-discover.png)

**Craft your perfect crosshair. Vector-crisp, click-through overlay for Windows with live Squad multiplayer.**

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011-blue.svg)](#system-requirements)
[![Release](https://img.shields.io/badge/Release-v0.2.0-brightgreen.svg)](https://github.com/shadowwwraz/crossforge/releases)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Safety](https://img.shields.io/badge/Anti--Cheat-Safe%20(No%20Hooks)-success.svg)](#anti-cheat--safety)

[**Download Latest Installer (.exe)**](https://github.com/shadowwwraz/crossforge/releases/tag/v0.2.0) • [Features](#key-features) • [Squad Feature](#-squad-multiplayer-lobbies-new) • [FAQ](#anti-cheat--safety) • [Русское описание](#описание-на-русском)

</div>

---

## Overview

**CrossForge** is a modern, studio-grade crosshair overlay application engineered for competitive gamers and desktop enthusiasts. It projects a hardware-accelerated, transparent, and completely click-through vector reticle over any borderless or windowed application.

Unlike legacy overlay software, CrossForge does **not** hook into game memory or modify binary game files, ensuring complete anti-cheat neutrality.

---

## Key Features

### 👥 Squad Multiplayer Lobbies (NEW)
- **Zero-Config Real-Time Lobbies**: Join up with friends instantly using 6-character room codes (`CF-XXXX`) without creating accounts.
- **Live Crosshair Synchronization**: See teammates' active crosshairs, live online status, and avatars rendered in real time.
- **1-Click Equip & Transfer**: Tap the magic wand `🪄` to equip your teammate's exact reticle or the send button `✈️` to push your crosshair design to a squad member.

### 📐 Vector-Crisp Renderer
Every crosshair is mathematically generated from geometric primitives:
- **Shapes supported**: `Cross`, `Dot`, `Ring`, `Brackets`, `Triangle`, `Square`.
- **Arbitrary DPI & Resolution**: Scales flawlessly from 1080p up to 4K+ without pixelation or blur.
- **Customizable styling**: Per-layer offsets, gaps, length, thickness, rotation, color, glow, and outlines.

### 🎨 Studio Designer
- **Live Interactive Canvas**: Drag directly on the preview to adjust offsets in real time.
- **Layer-by-Layer Stacking**: Combine multiple reticle components into intricate designs.
- **Micro-Nudging**: Adjust crosshair position pixel-by-pixel using hotkeys (`Ctrl + Alt + Arrow Keys` or Numpad) even during gameplay.

### ⚡ True Click-Through & System Performance
- **Zero Mouse Latency & No Cursor Flicker**: Implements strict OS-level non-capturing transparent windows (`WS_EX_TRANSPARENT`), preventing Windows cursor redraw stutter.
- **Display Affinity Protection**: Option to hide the crosshair from OBS, Discord stream, or Xbox Game Bar captures (`setContentProtection`).
- **Tray Mode**: Minimizes cleanly to the system tray while keeping hotkeys and overlay active.

### 📦 18 Competitive Presets & Sharing
- Comes with 18 hand-crafted reticles tailored for tactical shooters, battle royales, and arena FPS.
- Easily share configurations via concise Base64 share codes or `.crossforge.json` profile files.

### 🌓 Dual Aesthetic & Localization
- **Forge Lab (Dark)**: Deep graphite (`#08080A`) with vibrant neon lime (`#C6FF00`) and cyber cyan accents.
- **Studio (Light)**: Warm archival paper aesthetic (`#F1EFE9`) with ink typography and indigo accents.
- **Bilingual Interface**: Full native support for **English** and **Русский**, with automatic Windows locale detection.

---

## Screenshots

<div align="center">

### Squad Multiplayer Drawer
![CrossForge Squad](docs/screenshot-squad.png)

### Studio Designer
![CrossForge Designer](docs/screenshot-editor.png)

### Library & Discovery
![Crosshair Library](docs/screenshot-library.png)

### Light Theme (Studio)
![Studio Light Theme](docs/screenshot-settings-light.png)

</div>

---

## Installation & Download

1. Download the latest release from the **[Releases](https://github.com/shadowwwraz/crossforge/releases/tag/v0.2.0)** page:
   - **`CrossForge-Setup-0.2.0.exe`** — Windows Installer (recommended)
   - **`CrossForge-Portable-v0.2.0.zip`** — Portable standalone version (no install required)
2. Run the application.
3. Choose or customize your reticle, press `Ctrl + Alt + X` (or `F8`) to toggle the overlay on/off, and jump into your game!

> **Tip:** Ensure your game display mode is set to **Borderless Windowed** or **Windowed**. Exclusive Fullscreen mode bypasses standard desktop window composition.

---

## Anti-Cheat & Safety

- **No Memory Reading/Injection:** CrossForge operates strictly in Windows user space as an independent top-level transparent overlay window.
- **No DLL Hooking:** It does not interact with game executables, anti-cheat drivers (Vanguard, Easy Anti-Cheat, BattlEye, VAC), or Direct3D swap chains.
- *Tournament Note:* While technologically equivalent to a hardware crosshair on a gaming monitor, always verify tournament-specific software guidelines before competing.

---

## System Requirements

- **OS**: Windows 10 (1903+) or Windows 11 (64-bit)
- **Architecture**: x64
- **Graphics**: Hardware-accelerated graphics support

---

## Описание на русском

**CrossForge** — профессиональный оверлей прицелов для Windows с векторным рендерингом, нулевым инпут-лагом и поддержкой совместных комнат (Сквад).

### Особенности:
- **Мультиплеер Сквада (NEW):** Подключайтесь к друзьям по короткому коду лобби (`CF-XXXX`) без регистрации. Просматривайте прицелы тиммейтов в реальном времени, копируйте их в один клик волшебной палочкой `🪄` или отправляйте свои `✈️`.
- **Векторная четкость:** Никаких мыльных растровых картинок — прицел собирается из математических примитивов и выглядит идеально на Full HD, 2K и 4K мониторах.
- **Редактор геометрии:** Настройка слоёв, цветов, зазоров, толщины, свечения и контура.
- **Click-Through без лагов:** Специальный режим окна Windows, не перехватывающий клики мыши и не вызывающий мерцания курсора.
- **Защита стрима:** Функция скрытия оверлея от захвата в OBS, Discord и Game Bar.
- **18 готовых пресетов:** Набор прицелов для соревновательных шутеров, импорт и экспорт настроек через код шеринга.
- **Горячие клавиши:** Быстрое включение/выключение и смещение прицела на 1 пиксель прямо во время игры (`Ctrl + Alt + стрелки`).
- **Интерфейс:** Полная поддержка русского языка и две проработанные темы оформления (тёмная *Forge Lab* и светлая *Studio*).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
