# 四级跃迁 · four-web 更新指南

网站：<https://kexiangqi15-glitch.github.io/four-web/>

仓库：<https://github.com/kexiangqi15-glitch/four-web>

本次修订已经发布。下面的步骤供以后自行更新使用。只替换网站文件不会清除浏览器中的学习进度；但更换浏览器或清除网站数据会重置进度。

## 1. 先备份

打开仓库，点击绿色 **Code** → **Download ZIP**，把下载的压缩包保存好。确认正在使用 `main` 分支。

## 2. 上传首页

在仓库最外层点击 **Add file** → **Upload files**，选择本地 `index.html` 和 `DEPLOY.md`。等文件名都显示出来，选择 **Commit directly to the main branch**，点击 **Commit changes**。

## 3. 更新网页脚本与词库

这两个文件必须放到正确的子文件夹，不能上传到仓库最外层：

1. 点击仓库里的 `assets` 文件夹，在该文件夹内点击 **Add file** → **Upload files**，上传本地 `assets/app.js`，提交。
2. 回到仓库首页，点击 `data` 文件夹，在该文件夹内同样上传本地 `data/vocabulary.json`，提交。

## 4. 更新六卷教材

打开仓库里的 `volumes` 文件夹，点击 **Add file** → **Upload files**，一次选中本地 `volumes` 中的六个 `*-units-*.md` 文件，等待全部上传完成后提交。这样网站与下载教材的释义才能一致。

## 5. 检查发布

打开仓库的 **Actions**，等待最新的 Pages 部署任务出现绿色对勾。随后打开网站并按 `Ctrl+F5` 刷新。检查 Unit 27 的 `portrait` 显示为“肖像；画像；人像”，`efficiently` 显示为 `adv.`。六卷教材链接也应能打开。

如果页面还是旧版，先确认 `index.html`、`assets/app.js`、`data/vocabulary.json` 都上传到上述正确位置；再强制刷新。词库加载失败通常是 `data/vocabulary.json` 路径放错。手机上可关闭标签页后重新打开。

官方参考：[配置 GitHub Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
