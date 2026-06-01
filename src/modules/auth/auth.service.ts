import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/AppError';
import { JwtPayload } from '../../common/middlewares/auth';
import { TokenPair } from '../../common/types';
import { RegisterInput, LoginInput } from './auth.validation';

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    // Verify source language exists
    const language = await prisma.language.findUnique({
      where: { code: input.sourceLanguageCode },
    });
    if (!language) {
      throw AppError.badRequest(`Unsupported source language: ${input.sourceLanguageCode}`);
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        sourceLanguageCode: input.sourceLanguageCode,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
        xp: true,
        streakCount: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, ...tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    // Verify the JWT
    let decoded: { userId: string; type: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw AppError.unauthorized('Invalid token type');
    }

    // Check token hash in DB
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw AppError.unauthorized('Refresh token not found or revoked');
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { ...tokens };
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string, userId: string) {
    const tokenHash = this.hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        sourceLanguageCode: true,
        targetLanguageCode: true,
        currentCefrLevel: true,
        xp: true,
        streakCount: true,
        lastStudyDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  // ---- Private helpers ----

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId, type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any },
    );

    // Store refresh token hash in DB
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN));

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30 days

    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}

export const authService = new AuthService();
