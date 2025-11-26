import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import redisClient from '../config/redis.js';
import { 
  User, 
  UserWithPassword, 
  RegisterRequest, 
  LoginRequest, 
  AuthToken,
  JWTPayload 
} from '../types/user.types.js';
import { 
  UnauthorizedError, 
  ConflictError 
} from '../utils/errors.js';
import { 
  validateEmail, 
  validatePassword, 
  validateName 
} from '../utils/validation.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 15;

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthToken> {
    // Validate input
    validateEmail(data.email);
    validatePassword(data.password);
    validateName(data.name);

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, is_admin, created_at, updated_at`,
      [data.email.toLowerCase(), passwordHash, data.name]
    );

    const user: User = result.rows[0];

    // Generate JWT token
    const token = this.generateToken(user);

    // Store session in Redis
    await this.storeSession(user.id, token);

    return { token, user };
  }

  async login(data: LoginRequest): Promise<AuthToken> {
    validateEmail(data.email);

    // Get user with password hash
    const result = await pool.query<UserWithPassword>(
      `SELECT id, email, name, is_admin, password_hash, failed_login_attempts, 
              account_locked_until, created_at, updated_at 
       FROM users 
       WHERE email = $1`,
      [data.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userWithPassword = result.rows[0];

    // Check if account is locked
    if (userWithPassword.account_locked_until) {
      const lockoutEnd = new Date(userWithPassword.account_locked_until);
      if (lockoutEnd > new Date()) {
        const minutesRemaining = Math.ceil(
          (lockoutEnd.getTime() - Date.now()) / 60000
        );
        throw new UnauthorizedError(
          `Account is locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minutes.`
        );
      } else {
        // Lockout period has expired, reset failed attempts
        await pool.query(
          `UPDATE users 
           SET failed_login_attempts = 0, account_locked_until = NULL 
           WHERE id = $1`,
          [userWithPassword.id]
        );
        userWithPassword.failed_login_attempts = 0;
        userWithPassword.account_locked_until = null;
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      userWithPassword.password_hash
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = userWithPassword.failed_login_attempts + 1;
      
      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock account
        const lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60000
        );
        await pool.query(
          `UPDATE users 
           SET failed_login_attempts = $1, account_locked_until = $2 
           WHERE id = $3`,
          [newFailedAttempts, lockoutUntil, userWithPassword.id]
        );
        throw new UnauthorizedError(
          `Account locked due to ${MAX_FAILED_ATTEMPTS} failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
        );
      } else {
        // Update failed attempts
        await pool.query(
          `UPDATE users 
           SET failed_login_attempts = $1 
           WHERE id = $2`,
          [newFailedAttempts, userWithPassword.id]
        );
        throw new UnauthorizedError('Invalid email or password');
      }
    }

    // Reset failed login attempts on successful login
    if (userWithPassword.failed_login_attempts > 0) {
      await pool.query(
        `UPDATE users 
         SET failed_login_attempts = 0, account_locked_until = NULL 
         WHERE id = $1`,
        [userWithPassword.id]
      );
    }

    // Create user object without password
    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      is_admin: userWithPassword.is_admin || false,
      created_at: userWithPassword.created_at,
      updated_at: userWithPassword.updated_at,
    };

    // Generate JWT token
    const token = this.generateToken(user);

    // Store session in Redis
    await this.storeSession(user.id, token);

    return { token, user };
  }

  async logout(userId: string, token: string): Promise<void> {
    // Remove session from Redis
    await redisClient.del(`session:${userId}`);
    
    // Add token to blacklist (optional, for extra security)
    const decoded = jwt.decode(token) as JWTPayload & { exp: number };
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.setEx(`blacklist:${token}`, ttl, 'true');
      }
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const result = await pool.query<User>(
      'SELECT id, email, name, is_admin, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    return result.rows[0];
  }

  async updateProfile(userId: string, updates: { name?: string }): Promise<User> {
    if (updates.name) {
      validateName(updates.name);
    }

    const result = await pool.query<User>(
      `UPDATE users 
       SET name = COALESCE($1, name), updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, email, name, is_admin, created_at, updated_at`,
      [updates.name, userId]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    return result.rows[0];
  }

  generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async storeSession(userId: string, token: string): Promise<void> {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return;
    }
    
    const sessionData = {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Store session with 24-hour TTL
    await redisClient.setEx(
      `session:${userId}`,
      24 * 60 * 60,
      JSON.stringify(sessionData)
    );
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    // Skip if Redis is not connected
    if (!redisClient.isOpen) {
      return false;
    }
    
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  }
}

export default new AuthService();
