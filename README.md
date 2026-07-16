# باغ دیجیتال (Digital Garden)

پروژه کارشناسی — طراحی و پیاده‌سازی یک **باغ دیجیتال تعاملی** مبتنی بر گراف دانش با پیوندهای دوسویه.

## ویژگی‌ها (MVP)

- **ویرایشگر TipTap** با پشتیبانی Markdown و سینتکس لینک `[[عنوان یادداشت]]`
- **بک‌لینک خودکار** — تحلیل متن و ایجاد پیوند دوسویه در PostgreSQL
- **نمای باغ (Garden View)** — گراف تعاملی با React Flow (کشیدن، زوم، کلیک)
- **گراف محلی (Local Graph)** — همسایگان مستقیم هر یادداشت
- **داشبورد** — آمار باغ، بذرهای یتیم، آخرین ویرایش‌ها
- **یافتن مسیر** — الگوریتم BFS و کوئری `WITH RECURSIVE` در PostgreSQL

## پشته فناوری

| لایه | فناوری |
|------|--------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Editor | TipTap |
| Graph UI | React Flow (@xyflow/react) |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |

## اجرا با Docker (پیشنهادی)

```bash
# ساخت و اجرای اپ + دیتابیس
docker compose up --build

# اپ: http://localhost:3000
# دیتابیس: localhost:5432
```

ورود نمونه (بعد از seed):
- **ایمیل:** `demo@garden.local`
- **رمز:** `demo123456`

## توسعه محلی

```bash
# فقط دیتابیس
docker compose up -d db

cp .env.example .env

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

## ساختار دیتابیس (ERD)

```
User 1──N Note 1──N Link N──1 Note
```

- **User** — کاربران سیستم
- **Note** — بذرها (یادداشت‌ها) با موقعیت گراف (`posX`, `posY`)
- **Link** — یال‌های گراف (source → target)، بک‌لینک از طریق query معکوس

## APIهای اصلی

| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/login` | ورود |
| GET/POST | `/api/notes` | لیست / ایجاد یادداشت |
| GET/PUT/DELETE | `/api/notes/[slug]` | CRUD یادداشت |
| GET | `/api/graph` | گراف کامل یا مسیر (`?from=&to=&method=bfs\|cte`) |
| GET | `/api/graph/local/[slug]` | گراف محلی |
| GET | `/api/dashboard` | آمار و بذرهای یتیم |

## لینک‌دهی Wiki-style

در متن یادداشت بنویسید:

```
این ایده به [[مدیریت دانش]] مرتبط است.
```

سیستم عنوان یا slug را match کرده و لینک + بک‌لینک ایجاد می‌کند.

## اسکریپت‌ها

```bash
npm run dev          # توسعه
npm run build        # build تولید
npm run db:migrate   # migration توسعه
npm run db:seed      # داده نمونه
npm run db:studio    # Prisma Studio
```

## مجوز

پروژه آموزشی — پروژه کارشناسی
