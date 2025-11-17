import { randomUUID } from 'crypto';

import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/error-handler';
import { logAction } from './log.service';
import { generateAccountNumber } from '../utils/account-number';
import { hashPassword } from '../utils/password';

interface AccountPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  profilePicture?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const createAccountAsAdmin = async (payload: AccountPayload, adminId: string) => {
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { mobileNumber: payload.mobileNumber }] }
  });

  if (exists) {
    throw new HttpError(409, 'Email or mobile already exists');
  }

  const temporaryPassword = randomUUID();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      fullName: payload.fullName,
      mobileNumber: payload.mobileNumber,
      profilePicture: payload.profilePicture,
      address: payload.address,
      status: payload.status ?? 'ACTIVE',
      role: 'USER',
      passwordHash,
      accounts: {
        create: {
          status: payload.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          accountNumber: generateAccountNumber()
        }
      }
    },
    include: { accounts: true }
  });

  await logAction({
    log: `Admin ${adminId} created account ${user.accounts[0]?.accountNumber ?? ''}`,
    userId: adminId,
    type: 2
  });

  return { user, temporaryPassword };
};

export const getAccounts = async () => {
  return prisma.account.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAccountByUser = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: { userId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          mobileNumber: true,
          profilePicture: true,
          address: true
        }
      },
      transactions: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!account) {
    throw new HttpError(404, 'Account not found');
  }

  return account;
};

export const updateAccountAsUser = async (
  userId: string,
  data: Partial<Pick<AccountPayload, 'fullName' | 'address' | 'profilePicture'>>
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      address: true,
      profilePicture: true
    }
  });
};

export const updateAccountAsAdmin = async (accountId: string, data: Partial<AccountPayload>) => {
  const account = await prisma.account.update({
    where: { id: accountId },
    data: {
      ...(data.status ? { status: data.status } : {})
    },
    include: {
      user: true
    }
  });

  if (data.fullName || data.address || data.profilePicture || data.status) {
    await prisma.user.update({
      where: { id: account.userId },
      data: {
        fullName: data.fullName,
        address: data.address,
        profilePicture: data.profilePicture,
        ...(data.status ? { status: data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' } : {})
      }
    });
  }

  return account;
};

export const deleteAccount = async (accountId: string) => {
  await prisma.transaction.deleteMany({ where: { accountId } });
  await prisma.account.delete({ where: { id: accountId } });
};

