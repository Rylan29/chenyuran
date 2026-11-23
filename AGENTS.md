# AGENTS.md

## 项目概况

纯静态《高级网页设计》课程作业站：原生 HTML / CSS / JS，无构建、无测试、无 lint。
`index.html` 是入口与课程目录；每个练习页通常是根目录下的 `*.html` + 同名 `*.css`。
`netlify.toml` 只配置了 `publish = "."`，部署内容就是仓库根目录。

## 运行与验证

- 没有 npm 脚本或开发服务器配置，直接用浏览器打开 `index.html` 验证。
- 修改后必须手动检查页面渲染、交互，以及图片 / 字体 / CSS 的相对路径。
- 不要把根目录的 `node.exe`、`node-v24.20.0-x64.msi`、`npm*`、`corepack*`、`install_tools.bat` 当作构建工具：它们是误提交的 Node.js 发行文件。

## 目录与所有权

- 根目录页面是当前学生（24001010325 陈禹燃）的作品。进行中的新练习：`tengxun.html` / `tengxun.css`、`style.css`、`font_tengxun1/`、`font_tengxun2/`、`img/banner*`、`img/card*`。
- `1/`、`2002120309曹炳宇/`、`24001010915/`、`wangyao-information/` 是其他同学提交的作品，仍在 `HEAD` 中，但当前工作区已把它们删除（约 9500 个 `D` 条目）。
- 因此禁止用 `git add -A` 或 `git add .` 提交：这会把同学作品的大规模删除一起提交。只 stage 自己实际修改的文件。
- `2002120309曹炳宇/web-c/` 曾提交完整的 Git for Windows 安装目录，体积很大，不要复制或扩散。

## Git 与凭据

- 远程仓库：`https://gitee.com/neusoft_wangyao_jsj/webdesign004project.git`；本地 `master` 跟踪 `origin/master`（也存在 `origin/main`）。
- 提交信息使用中文，区分「新增页面」「美化样式」「修复」等。
- 远程 URL 和 `.opencode/skills/*` 中存在明文 Gitee 令牌。不要打印、复制、写入文档或继续提交这些令牌；推送时复用现有 `origin` / 凭据即可。

## 页面约定

- 页面必须包含 `lang="zh-CN"`、`<meta charset="UTF-8">` 和 viewport。
- 课程要求原生代码；`tengxun.html` 目前通过 `at.alicdn.com` 引入 iconfont，本地副本在 `font_tengxun*/`，二者可能不同步。
- 新增页面后要同步更新 `index.html` 的课程卡片（`.card-grid`）和「共收录 N 个练习页面」计数。
- **提示词记录**：每次响应用户请求后，都要把该轮的用户原始提示词、关键响应和验证结果追加到根目录 `cyr_prompt.md`（格式：时间戳 / 模型 / `>` 引用提示词 / 关键响应 / 验证结果），不要覆盖已有记录。

## 已知过时内容

- `.opencode/skills/webdesign/SKILL.md` 描述的是另一位学生（赵雨欣）和 `D:\gaojiwangye` 的旧结构，其中提到的 `zwjs.html` / `zyx.html` 已不存在；以当前根目录实际情况为准。
- `.opencode/skills/` 下的提交类 skill 含凭据，仅作流程参考。
