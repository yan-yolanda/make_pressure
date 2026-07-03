# make_pressure

认知压力任务网页。

## 在线访问

- https://makepressure.yantingting.me
- https://yan-yolanda.github.io/make_pressure/

## GitHub Pages 部署

仓库使用 GitHub Actions 部署静态站点。

若出现 `Deployment failed, try again later`：

1. 打开 [Actions](https://github.com/yan-yolanda/make_pressure/actions)
2. 找到失败的 `pages build and deployment` 或 `Deploy static site to Pages`
3. 点击 **Re-run all jobs** 重新运行

该错误通常是 GitHub Pages 服务端临时故障，构建成功但发布失败；重新运行通常即可恢复。

建议在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**，使用 `.github/workflows/deploy-pages.yml` 直接部署静态文件（无需 Jekyll 构建）。
