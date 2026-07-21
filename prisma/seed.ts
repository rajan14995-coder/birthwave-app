import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = [
    "Childbirth Education",
    "PCOS Management",
    "Cosmetic Gynaecology",
    "Retreats",
    "Yoga",
    "Trying to Conceive",
    "Pregnancy",
    "Lactation",
    "Postpartum Counselling",
    "Gynaecology",
    "Laparoscopy",
    "Preventive Gynaecology",
    "General Consultation",
  ];

  for (const name of services) {
    await prisma.service.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed one staff member for local testing.
  // Change this phone number to your own — you'll log in to /login/staff with it via OTP.
  await prisma.staff.upsert({
    where: { phone: "+918247748398" },
    update: {},
    create: {
      phone: "+918247748398",
      name: "Dr. Santoshi (Clinic Admin)",
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
