import { defineEventHandler, readBody, createError } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { ids } = await readBody(event);

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Geçersiz ID listesi' });
  }

  try {
    // TRANSACTION: Tüm işlem tek seferde olur, hata olursa hiçbir şey yapılmaz
    const result = await prisma.$transaction(async (tx) => {
      return await tx.payroll.updateMany({
        where: { id: { in: ids } },
        data: { 
          isPaid: true, 
          paymentDate: new Date(),
          updatedAt: new Date()
        }
      });
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Toplu Ödeme Hatası:", error);
    throw createError({ statusCode: 500, statusMessage: 'Ödeme işlemi başarısız.' });
  }
});