import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../src/lib/auth/permissions";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create all permissions
  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        description: code,
      },
    });
  }
  console.log(`Created ${PERMISSIONS.length} permissions`);

  // 2. Create roles and assign permissions
  for (const [roleName, permissionCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    });

    // Assign permissions to role
    for (const code of permissionCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code },
      });
      if (!permission) {
        console.warn(`Permission "${code}" not found, skipping`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`Role "${roleName}" with ${permissionCodes.length} permissions`);
  }

  // 3. Create admin user
  const adminRole = await prisma.role.findUnique({
    where: { name: "Admin" },
  });
  if (!adminRole) throw new Error("Admin role not found");

  const passwordHash = bcrypt.hashSync("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@crm.local" },
    update: {},
    create: {
      email: "admin@crm.local",
      name: "System Admin",
      passwordHash,
      roleRoleId: adminRole.id,
      status: "ACTIVE",
    },
  });
  console.log("Admin user created: admin@crm.local / admin123");

  // 4. Create default settings
  const defaultSettings = [
    { key: "company_name", value: "CRM Sales Inc.", category: "general" },
    { key: "default_currency", value: "USD", category: "general" },
    { key: "tax_rate", value: "0.12", category: "tax" },
    { key: "payment_terms_days", value: "30", category: "general" },
    { key: "lead_prefix", value: "LEAD", category: "document_numbers" },
    { key: "opportunity_prefix", value: "OPP", category: "document_numbers" },
    { key: "quotation_prefix", value: "QUO", category: "document_numbers" },
    { key: "customer_prefix", value: "CUST", category: "document_numbers" },
    { key: "sales_order_prefix", value: "SO", category: "document_numbers" },
    { key: "delivery_note_prefix", value: "DN", category: "document_numbers" },
    { key: "invoice_prefix", value: "INV", category: "document_numbers" },
    { key: "payment_prefix", value: "PAY", category: "document_numbers" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Created ${defaultSettings.length} settings`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
