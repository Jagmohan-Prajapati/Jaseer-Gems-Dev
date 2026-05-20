import express from "express";
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

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_change_me");

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    try {
      const { name, email, password } = req.body;
      const prisma = getPrisma();
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: "Email already exists" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash, role: "USER" },
      });

      const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
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
            
          res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
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

      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
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

  // Products API
  app.get("/api/products", async (req, res) => {
    const { featured, stoneColor, minPrice, maxPrice, minCarat, maxCarat, sort, page = 1, limit = 12 } = req.query;
    const prisma = getPrisma();
    
    const where: any = { isActive: true };
    if (featured === "true") where.isFeatured = true;
    if (stoneColor) {
      const colors = (stoneColor as string).split(",");
      where.stoneColor = { in: colors };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (minCarat || maxCarat) {
      where.caratWeight = {};
      if (minCarat) where.caratWeight.gte = parseFloat(minCarat as string);
      if (maxCarat) where.caratWeight.lte = parseFloat(maxCarat as string);
    }

    let orderBy: any = {};
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else orderBy = { createdAt: "desc" };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy, skip, take: parseInt(limit as string) }),
        prisma.product.count({ where }),
      ]);
      res.json({ products, total });
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
      await prisma.product.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (e) {
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

      const rpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // paise
        currency: "INR",
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
  app.get("/api/admin/orders", isAdmin, async (req, res) => {
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
