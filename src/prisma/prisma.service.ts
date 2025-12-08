import { Injectable, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const dmmf = Prisma['dmmf'];

// Helper function to create updateOrCreate method for model delegates
function createUpdateOrCreateMethod<TWhere, TData, TModel>(
  delegate: {
    findFirst: (args: { where: TWhere }) => Promise<TModel | null>;
    update: (args: { where: TWhere; data: Partial<TData> }) => Promise<TModel>;
    create: (args: { data: TWhere & Partial<TData> }) => Promise<TModel>;
  }
) {
  return async (searchPayload: TWhere, persistancePayload: Partial<TData>): Promise<TModel> => {
    const existing = await delegate.findFirst({ where: searchPayload });
    
    if (existing) {
      return await delegate.update({
        where: searchPayload,
        data: persistancePayload,
      });
    }
    
    return await delegate.create({
      data: { ...searchPayload, ...persistancePayload } as TWhere & Partial<TData>,
    });
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // add validation for model name
  getModelMeta(modelName: string):any {
    const model = dmmf.datamodel.models.find((m) => m.name === modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found in Prisma schema`);
    }
    return model;
  }


  /**
   * Update or create a record
   * @param modelDelegate - Prisma model delegate (e.g., this.room_users)
   * @param searchPayload - Criteria to search for existing record
   * @param persistancePayload - Data to update or create
   * @returns The updated or created record
   */
  async updateOrCreate(
    $model: any,
    $where: any,
    $data: Partial<any>
  ): Promise<any> {
    
    const existing = await $model.findFirst({ where: $where });
    if (existing) {
      console.log($where);
      return await $model.update({
        where: { id: existing.id },
        data: $data,
      });
    }

    return await $model.create({
      data: { ...$where, ...$data },
    });
    return null;
  }
}
