import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import lodgeRoutes from './modules/lodges/lodge.routes';
import guestRoutes from './modules/guests/guest.routes';
import roomRoutes from './modules/rooms/room.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import reportRoutes from './modules/reports/report.routes';
import adminRoutes from './modules/admin/admin.routes';
import uploadRoutes from './modules/upload/upload.routes';
import settingsRoutes from './modules/settings/settings.routes';
import ocrRoutes from './modules/ocr/ocr.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMK Rooms API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lodges', lodgeRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ocr', ocrRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
