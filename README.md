# 个人记账应用 (Personal Accounting App)

一个完整的个人记账全栈应用，支持收支记录的增删改查与余额统计。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Node.js + Express + TypeScript (tsx) + better-sqlite3
- **数据库**：SQLite（单文件 `server/data.db`）
- **包管理**：npm workspaces 单仓库管理

## 项目结构

```
testCount/
├── package.json            # 根项目，npm workspaces 配置
├── README.md               # 项目说明
├── server/                 # 后端服务
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts        # 入口，监听 3001
│       ├── app.ts          # Express 实例与中间件
│       ├── db/index.ts     # SQLite 连接、建表与查询封装
│       ├── routes/records.ts # REST 路由 + 输入校验
│       └── types.ts        # 类型定义
└── client/                 # 前端应用
    ├── package.json
    ├── vite.config.ts      # /api 代理到后端 3001
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx        # React 渲染入口
        ├── App.tsx         # 页面组合
        ├── index.css       # Tailwind 指令
        ├── types.ts
        ├── api/records.ts  # fetch 封装
        ├── hooks/useRecords.ts
        └── components/
            ├── SummaryCard.tsx
            ├── RecordForm.tsx
            └── RecordList.tsx
```

## 快速开始

### 1. 安装依赖（根目录执行一次即可）

```bash
npm install
```

### 2. 同时启动前后端

```bash
npm run dev
```

- 后端 API 运行在 `http://localhost:3001`
- 前端页面运行在 `http://localhost:5173`（Vite 自动代理 `/api` 请求到后端）

### 3. 单独启动

```bash
npm run dev:server   # 仅启动后端
npm run dev:client   # 仅启动前端
```

## API 接口文档

所有接口前缀为 `/api`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/records` | 获取所有收支记录（按日期倒序） |
| POST | `/api/records` | 新增收支记录 |
| PUT | `/api/records/:id` | 修改指定记录 |
| DELETE | `/api/records/:id` | 删除指定记录 |
| GET | `/api/summary` | 统计总收入、总支出、总余额 |

### 记录数据结构

```json
{
  "id": 1,
  "type": "income",            // income | expense
  "amount": 100.50,            // 正数
  "category": "工资",
  "date": "2026-07-09",        // YYYY-MM-DD
  "note": "本月工资",
  "createdAt": "2026-07-09T12:00:00.000Z"
}
```

### 新增/修改请求体

```json
{
  "type": "expense",
  "amount": 25.00,
  "category": "餐饮",
  "date": "2026-07-09",
  "note": "午餐"
}
```

### 摘要返回

```json
{
  "totalIncome": 100.50,
  "totalExpense": 25.00,
  "balance": 75.50
}
```

## 说明

- 首次启动后端会自动创建 `server/data.db` 数据库文件并建表。
- 后端保留 cors 中间件，可独立访问 API。
- 如需迁移数据库，仅需替换 `server/src/db/index.ts` 中的数据访问层。
