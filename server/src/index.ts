import app from './app.js';

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`[server] 记账后端已启动: http://localhost:${PORT}`);
});
