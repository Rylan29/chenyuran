/*
  作者：陈禹燃
  建立时间：2026-11-12 13:47
  使用模型：GLM-5.3-Flash
  功能名称：诗词数据服务器
  功能简介：基于 Express 的本地数据服务器，读取当前文件夹下 db.json 中 poems 数据，
           在 3007 端口提供 /poems 接口，并托管项目根目录静态页面。
*/

/**
 * 功能：启动诗词数据服务器（端口 3007）
 * 作者：陈禹燃
 * 建立时间：2026-11-12 13:47
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3007;

// db.json 文件路径（与 server.js 同目录）
const DB_PATH = path.join(__dirname, 'db.json');

/**
 * 功能：读取 db.json 并解析为对象
 * 作者：陈禹燃
 * 建立时间：2026-11-12 13:47
 * @param {void} 无参数
 * @returns {Object} db.json 解析后的数据对象，读取失败时抛出异常
 */
function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * 功能：为所有响应添加 CORS 跨域头，允许本地 HTML 页面直接访问接口
 * 作者：陈禹燃
 * 建立时间：2026-11-12 13:47
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 * @returns {void} 无返回值，处理完成后调用 next()
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

/**
 * 功能：提供 GET /poems 接口，返回 db.json 中 poems 数组（含 pic、title、content）
 * 作者：陈禹燃
 * 建立时间：2026-11-12 13:47
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {void} 以 JSON 形式返回诗词数据，失败时返回 500 错误
 */
app.get('/poems', (req, res) => {
  try {
    const data = readDb();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '读取 db.json 失败：' + err.message });
  }
});

/**
 * 功能：提供 GET /api/authors 接口，从 poems 数组中统计去重后的作者列表及作品数量
 * 作者：陈禹燃
 * 建立时间：2026-11-12 14:30
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {void} 以 JSON 形式返回 { authors: [{ name, count }] }，失败时返回 500 错误
 */
app.get('/api/authors', (req, res) => {
  try {
    const data = readDb();
    const poems = data.poems || [];

    // 用 Map 统计每位作者的作品数量，未填写作者的归入“佚名”
    const countMap = new Map();
    poems.forEach((poem) => {
      const name = poem.author || '佚名';
      countMap.set(name, (countMap.get(name) || 0) + 1);
    });

    const authors = Array.from(countMap, ([name, count]) => ({ name, count }));
    res.json({ authors });
  } catch (err) {
    res.status(500).json({ error: '读取 db.json 失败：' + err.message });
  }
});

// 托管项目根目录静态文件，便于直接访问 http://localhost:3007/poems.html
app.use(express.static(path.join(__dirname, '..')));

/**
 * 功能：启动服务器并监听 3007 端口
 * 作者：陈禹燃
 * 建立时间：2026-11-12 13:47
 * @returns {void} 控制台输出启动成功提示
 */
app.listen(PORT, () => {
  console.log(`诗词数据服务器已启动：http://localhost:${PORT}/poems`);
});
