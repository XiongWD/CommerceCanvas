# 这些截图无效（平移复制缺陷）

> 本目录下的 5 张 PNG（full-1440x900 / full-1280x800 / region-canvas / region-inspector / region-taskbar）
> 来自 ZCode IAB 的 `browser.tabs.screenshot()` 链路，经平移周期检测证实为**平移复制图**，**无效**。
>
> 有效截图见 `artifacts/frontend/g2-f0-r1-e1/`（独立 Playwright Chromium 采集，周期检测 PASS）。
>
> 本目录保留用于问题追溯，不得作为验收证据。

## 平移复制证据（check-screenshot-periodicity.mjs）

| 文件 | 横向偏移/MAE | 纵向偏移/MAE | 判定 |
|---|---|---|---|
| full-1440x900.png | 792 / 0.0056 | 495 / 0.0052 | FAIL |
| full-1280x800.png | 704 / 0.005 | 440 / 0.0042 | FAIL |
| region-canvas.png | 633 / 3.15 | 495 / 0.0047 | FAIL（纵向） |
| region-inspector.png | 271 / 7.77 | 495 / 0.0037 | FAIL（纵向） |
| region-taskbar.png | 792 / 0 | 29 / 1.28 | FAIL（横向） |

MAE < 0.5 即判定为平移复制。旧图最低 MAE 低至 0.0037（近逐像素相同）。
