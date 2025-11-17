import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/error-handler';
import { logAction } from './log.service';
import { hashPassword, verifyPassword } from '../utils/password';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateAccountNumber } from '../utils/account-number';

interface RegisterPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async ({ email, password, fullName, mobileNumber }: RegisterPayload) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { mobileNumber }] }
  });

  if (existing) {
    throw new HttpError(409, 'Email or mobile already in use');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      mobileNumber,
      role: 'USER',
      status: 'PENDING',
      accounts: {
        create: {
          accountNumber: generateAccountNumber(),
          status: 'INACTIVE'
        }
      }
    },
    include: { accounts: true }
  });

  await logAction({
    log: `User ${user.email} registered`,
    userId: user.id,
    type: 2
  });

  return user;
};

export const loginUser = async ({ email, password }: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true
    }
  });

  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const accessToken = createAccessToken({ sub: user.id, role: user.role });
  const refreshToken = createRefreshToken({ sub: user.id, role: user.role });

  await logAction({
    log: `User ${user.email} logged in`,
    userId: user.id,
    type: 2
  });

  return {
    user,
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

export const refreshSession = async (token: string) => {
  try {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new HttpError(401, 'User inactive');
    }

    return {
      accessToken: createAccessToken({ sub: user.id, role: user.role }),
      refreshToken: createRefreshToken({ sub: user.id, role: user.role })
    };
  } catch (error) {
    throw new HttpError(401, 'Refresh token invalid');
  }
};

