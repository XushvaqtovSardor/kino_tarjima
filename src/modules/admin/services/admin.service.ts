import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async isAdmin(telegramId: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { telegramId },
    });

    return !!admin;
  }

  async isSuperAdmin(telegramId: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { telegramId },
    });
    return admin?.role === AdminRole.SUPERADMIN;
  }

  async getAdminRole(telegramId: string): Promise<AdminRole | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { telegramId },
      select: { role: true },
    });
    return admin?.role || null;
  }

  async getAdminByTelegramId(telegramId: string) {
    return this.prisma.admin.findUnique({
      where: { telegramId },
    });
  }

  async hasPermission(
    telegramId: string,
    permission: string,
  ): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { telegramId },
    });

    if (!admin) return false;
    if (admin.role === AdminRole.SUPERADMIN) return true;

    if (admin.role === AdminRole.MANAGER) {
      return [
        'MANAGE_FIELDS',
        'MANAGE_CHANNELS',
        'UPLOAD_CONTENT',
        'DELETE_CONTENT',
      ].includes(permission);
    }

    return ['UPLOAD_CONTENT'].includes(permission);
  }

  async createAdmin(data: {
    telegramId: string;
    username?: string;
    role: string;
    canAddAdmin?: boolean;
    canDeleteContent?: boolean;
    createdBy: string;
  }) {
    // SUPERADMIN uchun avtomatik barcha huquqlar true bo'ladi
    const role = data.role as AdminRole;
    const isSuperAdmin = role === AdminRole.SUPERADMIN;
    const isManager = role === AdminRole.MANAGER;

    const canAddAdmin = isSuperAdmin ? true : (data.canAddAdmin || false);
    const canDeleteContent = isSuperAdmin || isManager ? true : (data.canDeleteContent || false);

    try {
      return await this.prisma.admin.create({
        data: {
          telegramId: data.telegramId,
          username: data.username,
          role: role,
          canAddAdmin: canAddAdmin,
          canDeleteContent: canDeleteContent,
          createdBy: data.createdBy,
        },
      });
    } catch (error) {
      // Agar admin allaqachon mavjud bo'lsa, yangilash
      if (error.code === 'P2002') {
        return await this.prisma.admin.update({
          where: { telegramId: data.telegramId },
          data: {
            username: data.username,
            role: role,
            canAddAdmin: canAddAdmin,
            canDeleteContent: canDeleteContent,
          },
        });
      }
      throw error;
    }
  }

  async listAdmins() {
    return this.prisma.admin.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findAll() {
    return this.listAdmins();
  }

  async getAllAdmins() {
    return this.listAdmins();
  }

  async deleteAdmin(telegramId: string) {
    return this.prisma.admin.delete({
      where: { telegramId },
    });
  }
}
