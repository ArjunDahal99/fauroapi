
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;

globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();


const db = globalForPrisma.prisma
export default db
