日语阅读手帐 v0.1 — 仅用 iPhone 开始

包含：index.html、manifest.webmanifest、sw.js、icon.png。

推荐部署：
1. iPhone Safari 访问 https://github.com 并注册/登录账号。
2. 新建 Public repository，名字例如 nihongo-reader。不要上传个人的阅读文章或照片，只上传本文件夹里的四个程序文件。
3. 在仓库里使用 Add file -> Upload files，选择 index.html、manifest.webmanifest、sw.js、icon.png 并提交。
   手机上找不到按钮时，Safari 通过页面菜单请求桌面网站。
4. 仓库 Settings -> Pages -> Build and deployment -> Deploy from a branch；选择 main 和 /(root)，保存。
5. 等 GitHub Pages 网站部署成功，打开 https://你的用户名.github.io/nihongo-reader/。
6. Safari 分享 -> 添加到主屏幕 -> 打开为网页 App -> 添加。
7. 打开 App，在「添加文章」里选择照片；要文字模式，可在 iOS 照片 App 使用实况文本复制日语，再粘贴到文章文字框。
8. 定期在「设置」->「导出完整备份」，将 JSON 备份存至 iCloud Drive。

注意：
- 第一版没有自动 OCR；照片和文章只在设备本地 IndexedDB 中，GitHub 仅托管程序代码。
- 删除主屏幕 App、清除网站数据、设备空间不足或系统清理，都可能导致数据丢失。务必定期备份。
- 打开 Safari 的网站与主屏幕 App 可能涉及独立网站存储，不要假设两者数据自动共享。首次确定使用主屏幕版本后，今后尽量在同一个入口添加文章。
- GitHub Pages 免费方案使用公开仓库：切勿将教材照片、OCR 文本、私密信息提交到仓库。
- 若离线打开失败，请联网重开一次，缓存需要在部署后第一次在线访问。
