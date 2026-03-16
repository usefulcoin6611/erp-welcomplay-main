import { prisma } from "./prisma";

export async function getSetting(key: string, userId: string | null = null) {
  if (userId) {
    const userSetting = await prisma.setting.findFirst({
      where: { key, userId },
    });
    if (userSetting) return userSetting;
  }

  return await prisma.setting.findFirst({
    where: { key, userId: null },
  });
}

export async function saveSetting(key: string, value: string, userId: string | null = null) {
  const existing = await prisma.setting.findFirst({
    where: { key, userId },
  });

  if (existing) {
    return await prisma.setting.update({
      where: { id: existing.id },
      data: { value },
    });
  } else {
    return await prisma.setting.create({
      data: { key, value, userId },
    });
  }
}
