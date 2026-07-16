import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "demo@garden.local";
  const password = await bcrypt.hash("demo123456", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name: "کاربر نمونه",
    },
  });

  await prisma.note.deleteMany({ where: { userId: user.id } });

  const notesData = [
    {
      title: "مدیریت دانش شخصی",
      slug: "مدیریت-دانش-شخصی",
      content:
        "باغ دیجیتال روشی نوین برای [[یادداشت‌برداری شبکه‌ای]] است. برخلاف پوشه‌های سلسله‌مراتبی، ایده‌ها از طریق [[پیوندهای دوسویه]] به هم متصل می‌شوند.",
      posX: 0,
      posY: 0,
    },
    {
      title: "یادداشت‌برداری شبکه‌ای",
      slug: "یادداشت‌برداری-شبکه‌ای",
      content:
        "در این روش هر یادداشت یک گره در [[گراف دانش]] است. ارتباطات غیرخطی تفکر انسان را بهتر شبیه‌سازی می‌کند.",
      posX: 280,
      posY: -80,
    },
    {
      title: "پیوندهای دوسویه",
      slug: "پیوندهای-دوسویه",
      content:
        "با سینتکس [[عنوان]] لینک ایجاد می‌شود و [[بک‌لینک]] به‌صورت خودکار در یادداشت مقصد ثبت می‌گردد.",
      posX: 280,
      posY: 120,
    },
    {
      title: "گراف دانش",
      slug: "گراف-دانش",
      content:
        "[[نمای باغ]] تمام گره‌ها و یال‌ها را به‌صورت تعاملی نمایش می‌دهد. الگوریتم [[BFS]] برای یافتن مسیر بین دو ایده استفاده می‌شود.",
      posX: 560,
      posY: 20,
    },
    {
      title: "بک‌لینک",
      slug: "بک‌لینک",
      content: "ارجاعات معکوس به کشف ارتباطات پنهان کمک می‌کنند.",
      posX: 560,
      posY: 200,
    },
    {
      title: "BFS",
      slug: "bfs",
      content:
        "پیمایش سطح‌اول برای کوتاه‌ترین مسیر در گراف. همچنین از [[CTE بازگشتی PostgreSQL]] پشتیبانی می‌شود.",
      posX: 840,
      posY: 20,
    },
    {
      title: "CTE بازگشتی PostgreSQL",
      slug: "cte-postgresql",
      content: "WITH RECURSIVE برای کوئری‌های پیشرفته گراف در پایگاه داده.",
      posX: 840,
      posY: 180,
    },
    {
      title: "نمای باغ",
      slug: "نمای-باغ",
      content: "بوم تعاملی React Flow با قابلیت کشیدن، زوم و کلیک.",
      posX: 140,
      posY: 280,
    },
    {
      title: "ایده یتیم",
      slug: "ایده-یتیم",
      content: "این یادداشت هنوز به هیچ بذر دیگری متصل نشده — نمونه بذر یتیم.",
      posX: -200,
      posY: 200,
    },
  ];

  const createdNotes = [];
  for (const data of notesData) {
    const note = await prisma.note.create({
      data: { ...data, userId: user.id },
    });
    createdNotes.push(note);
  }

  const byTitle = new Map(createdNotes.map((n) => [n.title.toLowerCase(), n.id]));
  const bySlug = new Map(createdNotes.map((n) => [n.slug.toLowerCase(), n.id]));

  const linkPattern = /\[\[([^\]]+)\]\]/g;

  for (const note of createdNotes) {
    const matches = [...note.content.matchAll(linkPattern)];
    const targetIds = new Set<string>();

    for (const match of matches) {
      const label = match[1].trim().toLowerCase();
      const id = byTitle.get(label) ?? bySlug.get(label);
      if (id && id !== note.id) targetIds.add(id);
    }

    for (const targetId of targetIds) {
      await prisma.link.create({
        data: { sourceId: note.id, targetId },
      });
    }
  }

  console.log("Seed completed.");
  console.log("Demo login: demo@garden.local / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
