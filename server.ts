import express, { Request, Response, NextFunction } from "express";
import type { JWTPayload } from "jose";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getPrisma } from "./src/lib/prisma.ts";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import cookieParser from "cookie-parser";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import crypto from "crypto";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string, type: "verify" | "reset") => {
  const subject = type === "verify"
    ? "Verify your JaseerGems account"
    : "Reset your JaseerGems password";

  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;background:#0D1B2A;color:#F5F0E8;padding:40px;border-radius:8px;">
      <h1 style="color:#C9A84C;font-size:28px;margin-bottom:4px;">JaseerGems</h1>
      <p style="color:#8a9ab0;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;">Jaipur • Established 1978</p>
      <h2 style="font-size:18px;margin-bottom:12px;">${type === "verify" ? "Verify Your Email" : "Reset Your Password"}</h2>
      <p style="color:#b0bec5;margin-bottom:28px;">Use this OTP code — it expires in <strong style="color:#F5F0E8;">10 minutes</strong>.</p>
      <div style="background:#112234;border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:28px;text-align:center;margin-bottom:28px;">
        <span style="font-size:42px;letter-spacing:14px;color:#C9A84C;font-weight:bold;">${otp}</span>
      </div>
      <p style="color:#5a6a7a;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"JaseerGems" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

interface AuthUser extends JWTPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user: AuthUser;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Cloudinary Config
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Razorpay Config
  const razorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
    ? new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    return res.status(400).json({ error: "Please use the OTP verification flow to register." });
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const prisma = getPrisma();

      // Admin Check
      if (email === process.env.ADMIN_EMAIL) {
        const adminValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || "");
        if (adminValid) {
          const token = await new SignJWT({ id: "admin", email, role: "ADMIN" })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET);
            
          res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
          });
          return res.json({ id: "admin", email, role: "ADMIN", name: "Admin" });
        }
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Send OTP for registration
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const prisma = getPrisma();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already registered" });

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.otpCode.create({ data: { email, code: otp, type: "VERIFY_EMAIL", expiresAt } });
      await sendOtpEmail(email, otp, "verify");
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP + create account
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { name, email, phone, password, otp } = req.body;
      const prisma = getPrisma();

      const record = await prisma.otpCode.findFirst({
        where: { email, code: otp, type: "VERIFY_EMAIL", used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

      await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, phone, passwordHash, role: "USER", isVerified: true },
      });

      const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Forgot password — send OTP
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.json({ success: true }); // don't reveal if email exists

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.otpCode.create({ data: { email, code: otp, type: "RESET_PASSWORD", expiresAt } });
      await sendOtpEmail(email, otp, "reset");
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Reset password — verify OTP + update password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const prisma = getPrisma();

      const record = await prisma.otpCode.findFirst({
        where: { email, code: otp, type: "RESET_PASSWORD", used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

      await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { email }, data: { passwordHash } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // Auth middleware — any logged in user
  const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      (req as AuthRequest).user = payload as AuthUser;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // GET user profile
  app.get("/api/user/profile", isAuth, async (req: Request, res: Response) => {
    const prisma = getPrisma();
    const authReq = req as AuthRequest;
    try {
      const user = await prisma.user.findUnique({
        where: { id: authReq.user.id },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // UPDATE user profile
  app.patch("/api/user/profile", isAuth, async (req: Request, res: Response) => {
    const prisma = getPrisma();
    const authReq = req as AuthRequest;
    try {
      const { name, phone } = req.body;
      const user = await prisma.user.update({
        where: { id: authReq.user.id },
        data: { name, phone },
        select: { id: true, name: true, email: true, phone: true },
      });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // CHANGE password (from account page)
  app.patch("/api/user/change-password", isAuth, async (req: Request, res: Response) => {
    const prisma = getPrisma();
    const authReq = req as AuthRequest;
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: authReq.user.id }, data: { passwordHash } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // GET all addresses for logged-in user
  app.get("/api/user/addresses", isAuth, async (req: Request, res: Response) => {
    const prisma = getPrisma();
    const authReq = req as AuthRequest;
    try {
      const addresses = await prisma.address.findMany({
        where: { userId: authReq.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
      res.json(addresses);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  // ADD new address
  app.post("/api/user/addresses", isAuth, async (req: Request, res: Response) => {
    const prisma = getPrisma();
    const authReq = req as AuthRequest;
    try {
      const { label, name, phone, line1, line2, city, state, zip, country, isDefault } = req.body;

      // If new address is default, unset all others first
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: authReq.user.id },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: { userId: authReq.user.id, label, name, phone, line1, line2, city, state, zip, country: country || "United States", isDefault: isDefault || false },
      });
      res.json(address);
    } catch (e) {
      res.status(500).json({ error: "Failed to add address" });
    }
  });

  // UPDATE address
  app.put("/api/user/addresses/:id", isAuth, async (req, res) => {
    const prisma = getPrisma();
    try {
      const { label, name, phone, line1, line2, city, state, zip, country, isDefault } = req.body;

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: (req as any).user.id },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.update({
        where: { id: req.params.id },
        data: { label, name, phone, line1, line2, city, state, zip, country, isDefault },
      });
      res.json(address);
    } catch (e) {
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  // DELETE address
  app.delete("/api/user/addresses/:id", isAuth, async (req, res) => {
    const prisma = getPrisma();
    try {
      await prisma.address.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  // GET logged-in user's orders
  app.get("/api/orders/my", isAuth, async (req, res) => {
    const prisma = getPrisma();
    try {
      const authReq = req as AuthRequest;
      const orders = await prisma.order.findMany({
        where: { userId: authReq.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      res.json(payload);
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Search products
  app.get("/api/products/search", async (req, res) => {
    const { q } = req.query;
    if (!q || (q as string).trim().length < 2) return res.json({ products: [] });
    const prisma = getPrisma();
    try {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q as string, mode: "insensitive" } },
            { description: { contains: q as string, mode: "insensitive" } },
            { stoneType: { contains: q as string, mode: "insensitive" } },
            { stoneColor: { contains: q as string, mode: "insensitive" } },
            { origin: { contains: q as string, mode: "insensitive" } },
          ],
        },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, price: true, images: true,
          stoneType: true, stoneColor: true, caratWeight: true,
        },
      });
      res.json({ products });
    } catch (e) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // GET /api/products — with optional search that floats matched results to top
  app.get("/api/products", async (req, res) => {
    const { featured, stoneColor, minPrice, maxPrice, minCarat, maxCarat, sort, page = 1, limit = 12, search } = req.query;
    const prisma = getPrisma();

    const baseWhere: any = { isActive: true };
    if (featured === "true") baseWhere.isFeatured = true;
    if (stoneColor) {
      const colors = (stoneColor as string).split(",");
      baseWhere.stoneColor = { in: colors };
    }
    if (minPrice || maxPrice) {
      baseWhere.price = {};
      if (minPrice) baseWhere.price.gte = parseFloat(minPrice as string);
      if (maxPrice) baseWhere.price.lte = parseFloat(maxPrice as string);
    }
    if (minCarat || maxCarat) {
      baseWhere.caratWeight = {};
      if (minCarat) baseWhere.caratWeight.gte = parseFloat(minCarat as string);
      if (maxCarat) baseWhere.caratWeight.lte = parseFloat(maxCarat as string);
    }

    let orderBy: any = {};
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else orderBy = { createdAt: "desc" };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    try {
      // No search term — normal paginated fetch
      if (!search || (search as string).trim().length < 2) {
        const [products, total] = await Promise.all([
          prisma.product.findMany({ where: baseWhere, orderBy, skip, take }),
          prisma.product.count({ where: baseWhere }),
        ]);
        return res.json({ products, total });
      }

      // Search: fetch ALL matching baseWhere, then split in JS
      const q = (search as string).trim().toLowerCase();

      const allProducts = await prisma.product.findMany({
        where: baseWhere,
        orderBy,
      });

      // Split: matched (name or stoneColor contains query) vs rest
      const matched = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.stoneColor && p.stoneColor.toLowerCase().includes(q))
      );
      const unmatched = allProducts.filter(p =>
        !p.name.toLowerCase().includes(q) &&
        !(p.stoneColor && p.stoneColor.toLowerCase().includes(q))
      );

      // Merge: matched floated to top, then rest
      const merged = [...matched, ...unmatched];
      const total = merged.length;
      const paginated = merged.slice(skip, skip + take);

      res.json({ products: paginated, total, matchedCount: matched.length });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const prisma = getPrisma();
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Admin middleware helper
  const isAdmin = async (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
      req.user = payload;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Admin Product Management
  app.post("/api/products", isAdmin, async (req, res) => {
    const prisma = getPrisma();
    try {
      const product = await prisma.product.create({ data: req.body });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    const prisma = getPrisma();
    try {
      const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.patch("/api/products/:id", isAdmin, async (req, res) => {
    const prisma = getPrisma();
    try {
      const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: "Failed to partial update product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    const prisma = getPrisma();

    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        select: { id: true, images: true },
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Delete Cloudinary images first
      if (Array.isArray(product.images) && product.images.length > 0) {
        const destroyPromises = product.images.map(async (imageUrl: string) => {
          try {
            // Extract public_id from Cloudinary URL
            // Example:
            // https://res.cloudinary.com/<cloud>/image/upload/v1234567890/jaseergems/abc123.jpg
            // => jaseergems/abc123
            const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp|avif)$/i);
            if (!match) return null;

            const publicId = match[1];
            return cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error("Cloudinary delete failed for:", imageUrl, err);
            return null;
          }
        });

        await Promise.all(destroyPromises);
      }

      // Delete product from DB
      await prisma.product.delete({
        where: { id: req.params.id },
      });

      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete product:", e);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Image Upload
  const upload = multer({ dest: "uploads/" });
  app.post("/api/upload", isAdmin, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    try {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "jaseergems" });
      res.json({ secure_url: result.secure_url, public_id: result.public_id });
    } catch (e) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Orders API
  app.post("/api/orders/create", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const prisma = getPrisma();
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const { items, shippingAddress, total } = req.body;

      if (!razorpay) throw new Error("Razorpay not configured");

      // Validate stock
      for (const item of items) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!prod || prod.stockQty < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${prod?.name || 'product'}` });
        }
      }

      const dbOrder = await prisma.order.create({
        data: {
          userId: payload.id as string,
          total,
          shippingAddress,
          status: "PENDING",
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      // Decrement stock for each ordered item
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      const rpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // paise
        currency: "USD",
        receipt: dbOrder.id,
      });

      await prisma.order.update({
        where: { id: dbOrder.id },
        data: { razorpayOrderId: rpOrder.id },
      });

      res.json({ orderId: dbOrder.id, razorpayOrderId: rpOrder.id, amount: total });
    } catch (e) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders/verify", async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpaySignature) {
      const prisma = getPrisma();
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: "PROCESSING",
          razorpayPaymentId,
          razorpaySignature,
          paidAt: new Date(),
          currency: "USD",
        },
      });
      res.json({ success: true, orderId: order.id });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  });

  app.get("/api/orders/my", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const prisma = getPrisma();
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const orders = await prisma.order.findMany({
        where: { userId: payload.id as string },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const prisma = getPrisma();
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: { items: { include: { product: true } } },
      });
      if (!order) return res.status(404).json({ error: "Order not found" });
      if (order.userId !== payload.id && payload.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(order);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Admin Orders
  app.get("/api/orders", isAdmin, async (req, res) => {
    const { status } = req.query;
    const prisma = getPrisma();
    const where: any = {};
    if (status) where.status = status;
    try {
      const orders = await prisma.order.findMany({
        where,
        include: { user: { select: { email: true } }, items: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch all orders" });
    }
  });

  app.patch("/api/orders/:id", isAdmin, async (req, res) => {
    const prisma = getPrisma();
    try {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(order);
    } catch (e) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    const prisma = getPrisma();
    try {
      const [totalActiveProducts, totalOrders, pendingOrders, revenueResult] = await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
        prisma.order.aggregate({
          where: { isPaid: true },
          _sum: { total: true },
        }),
      ]);
      res.json({
        totalActiveProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: revenueResult._sum.total || 0,
      });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // --- Vite / Frontend Setup ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
}

startServer();
