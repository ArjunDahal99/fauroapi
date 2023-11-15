
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;

globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
})


const db = globalForPrisma.prisma
export default db
