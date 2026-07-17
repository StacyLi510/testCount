---
name: personal-accounting-app
overview: 生成一个完整的"个人记账"全栈应用：前端 React+TypeScript+Tailwind CSS，后端 Node.js+Express+SQLite，实现收支记录的增删改查与余额统计，并包含完整文件夹结构。
design:
  architecture:
    framework: react
  styleKeywords:
    - Modern Dashboard
    - Card Layout
    - Clean
    - Blue-Green Primary
    - Subtle Shadow
    - Hover Transition
    - Responsive
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 28px
      weight: 700
    subheading:
      size: 18px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#0EA5E9"
      - "#14B8A6"
      - "#2563EB"
    background:
      - "#F1F5F9"
      - "#FFFFFF"
    text:
      - "#0F172A"
      - "#64748B"
    functional:
      - "#22C55E"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: scaffold-root
    content: 创建根 package.json（npm workspaces）与 README 文档
    status: completed
  - id: build-backend
    content: 实现 server：db 层、routes、app、index 与类型定义
    status: completed
    dependencies:
      - scaffold-root
  - id: scaffold-frontend
    content: 搭建 client：Vite+TS+Tailwind 配置、入口与全局样式
    status: completed
    dependencies:
      - scaffold-root
  - id: build-frontend-ui
    content: 实现前端 api/hooks 与 SummaryCard/RecordForm/RecordList 组件及 App 组合
    status: completed
    dependencies:
      - scaffold-frontend
      - build-backend
  - id: verify-run
    content: 安装依赖并验证前后端联调与核心功能
    status: completed
    dependencies:
      - build-frontend-ui
---

## 用户需求

生成一个完整的"个人记账"应用前后端项目，包含完整的文件夹结构。

## 产品概述

- 前端：React + TypeScript + Tailwind CSS，提供记账记录管理界面
- 后端：Node.js + Express，提供 REST API 服务
- 数据库：SQLite，存储收支记录数据
- 项目组织：根目录采用 npm workspaces 管理 server/ 与 client/ 两个子项目

## 核心功能

- 增加收支记录（类型：收入/支出、金额、分类、日期、备注）
- 修改已有收支记录
- 删除收支记录
- 查看所有收支记录列表
- 统计并显示总余额（总收入 - 总支出）

## Tech Stack Selection

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Node.js + Express + TypeScript（tsx 运行）+ better-sqlite3（同步 API，代码简洁，适合小项目）
- 数据库：SQLite（better-sqlite3 驱动，单文件数据库）
- 跨域：cors 中间件
- 包管理：npm workspaces 统一管理根项目、server、client

## Implementation Approach

采用 npm workspaces 单仓库（monorepo）结构，根目录统一安装依赖与脚本。后端使用 Express 提供标准 REST API，better-sqlite3 以同步方式访问 SQLite，避免回调嵌套。前端通过 Vite 代理（/api 指向后端 3001 端口）消除跨域问题，使用 fetch 调用接口。

关键决策：

1. **better-sqlite3 而非 sqlite3**：同步 API 简化 CRUD 代码，无回调地狱，性能对小项目足够；权衡是需要原生编译（Windows 下需构建工具链，但 npm 通常提供预编译二进制）。
2. **Vite 代理而非运行时 CORS 依赖**：开发期通过 vite.config 代理消除跨域，后端仍保留 cors 中间件以兼容生产/独立访问。
3. **REST 资源设计**：records 资源（GET/POST/PUT/DELETE）+ summary 聚合（GET /api/summary），职责清晰，便于后续扩展筛选/分页。

性能与可靠性：SQLite 单文件读写，数据量小时 O(1) 查询；summary 通过单条 SQL SUM 聚合（WHERE type='income' / 'expense'）避免前端全量计算；输入校验在后端层做（金额为正数字、类型枚举、日期格式），防止脏数据。

## Implementation Notes

- 后端启动时检查数据库文件是否存在，自动建表（records 表），保证首次运行可用。
- 金额字段使用 REAL/DECIMAL 存储，前端展示保留两位小数；避免浮点累加误差，可用整数分存储（可选，默认 REAL）。
- 前端列表组件使用受控状态 + 单一数据源（从 /api/records 拉取），增删改后重新拉取，避免本地状态与后端不一致。
- 错误统一返回 JSON { error: message }，前端以 toast/inline 提示，不抛出未捕获异常。
- 保留向后端独立运行的能力：server 监听 0.0.0.0:3001，cors 开放同源策略。
- 不引入多余抽象（如 ORM），保持 KISS；后续迁移数据库时仅需替换 db 层封装。

## Architecture Design

### System Architecture

客户浏览器 → React 组件（Vite Dev Server :5173，/api 代理）→ Express API (:3001) → better-sqlite3 → SQLite 文件 (data.db)

### 数据流

用户操作（新增/编辑/删除表单）→ fetch API → Express 路由 → db 层执行 SQL → 返回 JSON → 前端更新 state → 重新渲染列表与余额

### 模块依赖

- server: db（连接/建表/查询封装）→ routes（CRUD + summary）→ app（中间件/路由挂载）→ index（启动）
- client: api（fetch 封装）→ hooks（useRecords/useSummary）→ components（列表/表单/统计）→ App（组合）

## Directory Structure

```
testCount/
├── package.json                  # [NEW] 根项目，npm workspaces 配置，含 dev/build 聚合脚本
├── README.md                     # [NEW] 项目说明、启动方式、接口文档
├── server/
│   ├── package.json              # [NEW] 后端依赖（express, better-sqlite3, cors, typescript, tsx）与脚本
│   ├── tsconfig.json             # [NEW] 后端 TS 配置
│   └── src/
│       ├── index.ts              # [NEW] 入口：启动 Express，挂载中间件与路由，监听 3001
│       ├── app.ts                # [NEW] Express 实例、cors、json 解析、路由挂载
│       ├── db/
│       │   └── index.ts          # [NEW] better-sqlite3 连接、建表（records）、查询封装函数
│       ├── routes/
│       │   └── records.ts        # [NEW] REST 路由：GET/POST/PUT/DELETE /api/records，GET /api/summary；含输入校验
│       └── types.ts              # [NEW] Record 类型、ApiResponse 类型定义
└── client/
    ├── package.json              # [NEW] 前端依赖（react, react-dom, vite, tailwindcss, typescript）与脚本
    ├── tsconfig.json             # [NEW] 前端 TS 配置
    ├── tsconfig.node.json        # [NEW] Vite 节点配置
    ├── vite.config.ts            # [NEW] Vite 配置，含 /api 代理到 :3001
    ├── tailwind.config.js        # [NEW] Tailwind 配置
    ├── postcss.config.js         # [NEW] PostCSS 配置（tailwind + autoprefixer）
    ├── index.html                # [NEW] HTML 入口
    └── src/
        ├── main.tsx              # [NEW] React 渲染入口
        ├── App.tsx               # [NEW] 页面组合：统计卡 + 表单 + 列表
        ├── index.css             # [NEW] Tailwind 指令与全局样式
        ├── types.ts              # [NEW] Record/Summary 前端类型，对齐后端
        ├── api/
        │   └── records.ts        # [NEW] fetch 封装：getRecords/createRecord/updateRecord/deleteRecord/getSummary
        ├── hooks/
        │   └── useRecords.ts     # [NEW] 管理记录列表与摘要状态，封装增删改后刷新逻辑
        └── components/
            ├── SummaryCard.tsx   # [NEW] 展示总余额、总收入、总支出
            ├── RecordForm.tsx    # [NEW] 新增/编辑记录表单（类型/金额/分类/日期/备注）
            └── RecordList.tsx    # [NEW] 记录列表，含编辑/删除操作
```

## Key Code Structures

```typescript
// server/src/types.ts
export type RecordType = 'income' | 'expense';
export interface RecordItem {
  id: number;
  type: RecordType;
  amount: number;
  category: string;
  date: string;   // YYYY-MM-DD
  note: string;
  createdAt: string;
}
export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
```

## Design Style

采用现代简洁的 Dashboard 风格，使用 Tailwind CSS 构建。整体以卡片化布局为主，顶部为余额统计卡片（收入/支出/结余三栏），中部为新增/编辑记录表单，下方为记录列表（按日期倒序）。配色使用清新蓝绿主色调，收入用绿色、支出用红色语义色。交互上加入 hover 高亮、按钮过渡动画、卡片轻微阴影，列表项删除/编辑操作清晰可见。响应式布局：桌面端表单与列表左右或上下分区，移动端自动堆叠为单列。

## 页面规划

单页应用（App），包含以下区块：

1. 顶部导航栏：应用标题"个人记账" + 简易图标
2. 余额统计区：三张统计卡片（总收入、总支出、结余）
3. 记录表单区：新增/编辑收支记录（类型切换、金额、分类、日期、备注、提交按钮）
4. 记录列表区：表格/卡片列表，每条含类型标签、金额、分类、日期、备注、编辑/删除按钮
5. 底部状态栏：记录总数提示