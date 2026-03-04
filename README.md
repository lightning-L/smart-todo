This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### 登录与多设备同步（可选）

- 不登录也可正常使用，数据仅存于本机。
- 使用 Google 登录后，数据会与云端同步，多设备一致；本地修改会立即推送到云端，打开应用时会拉取并合并云端数据。
- 若在未登录时做过修改，登录后会自动合并本地与云端数据（同 id 取较新版本）。

**配置步骤：**

1. 在 [Supabase](https://supabase.com) 注册并创建项目。
2. 复制 `.env.local.example` 为 `.env.local`，填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（在 Supabase 项目 Settings → API 中查看）。
3. 在 Supabase 控制台 **SQL Editor** 中执行项目根目录下的 `supabase-schema.sql`，创建 `tasks`、`daily_logs` 表及 RLS 策略。
4. 在 **Authentication → Providers** 中启用 **Google**，并配置 Google Cloud Console 的 OAuth 客户端 ID 与密钥（重定向 URI 使用 Supabase 提供的回调地址）。

重启开发服务器后，侧栏会显示「使用 Google 登录」按钮。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
