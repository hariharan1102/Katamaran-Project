const qr = require('qrcode');
const prisma = require('../config/db');

// Helper to aggregate analytics data for a specific ShortUrl
const aggregateAnalytics = async (shortUrl) => {
  const urlId = shortUrl.id;

  // 1. Total clicks
  const totalClicks = await prisma.visit.count({
    where: { shortUrlId: urlId },
  });

  // 2. Last visited time
  const lastVisit = await prisma.visit.findFirst({
    where: { shortUrlId: urlId },
    orderBy: { visitedAt: 'desc' },
    select: { visitedAt: true },
  });
  const lastVisitedAt = lastVisit ? lastVisit.visitedAt : null;

  // 3. Recent 10 visits
  const recentVisits = await prisma.visit.findMany({
    where: { shortUrlId: urlId },
    orderBy: { visitedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      visitedAt: true,
      ipAddress: true,
      browser: true,
      device: true,
      country: true,
    },
  });

  // 4. Daily click trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push({ date: dateStr, clicks: 0 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trendVisits = await prisma.visit.findMany({
    where: {
      shortUrlId: urlId,
      visitedAt: { gte: sevenDaysAgo },
    },
    select: { visitedAt: true },
  });

  trendVisits.forEach((visit) => {
    const dateStr = visit.visitedAt.toISOString().split('T')[0];
    const day = last7Days.find((d) => d.date === dateStr);
    if (day) {
      day.clicks++;
    }
  });

  // 5. Device breakdown
  const deviceStats = await prisma.visit.groupBy({
    by: ['device'],
    where: { shortUrlId: urlId },
    _count: { device: true },
  });
  const deviceBreakdown = deviceStats.map((stat) => ({
    name: stat.device,
    value: stat._count.device,
  }));

  // 6. Browser breakdown
  const browserStats = await prisma.visit.groupBy({
    by: ['browser'],
    where: { shortUrlId: urlId },
    _count: { browser: true },
  });
  const browserBreakdown = browserStats.map((stat) => ({
    name: stat.browser,
    value: stat._count.browser,
  }));

  return {
    urlInfo: {
      id: shortUrl.id,
      originalUrl: shortUrl.originalUrl,
      shortCode: shortUrl.shortCode,
      customAlias: shortUrl.customAlias,
      expiresAt: shortUrl.expiresAt,
      createdAt: shortUrl.createdAt,
    },
    totalClicks,
    lastVisitedAt,
    recentVisits,
    dailyClickTrend: last7Days,
    deviceBreakdown,
    browserBreakdown,
  };
};

// GET /api/urls/:id/analytics (Protected)
const getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { id },
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (shortUrl.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view analytics for this URL' });
    }

    const analytics = await aggregateAnalytics(shortUrl);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// GET /api/urls/public/:shortCode (Public stats page)
const getPublicUrlStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const shortUrl = await prisma.shortUrl.findFirst({
      where: {
        OR: [
          { shortCode },
          { customAlias: shortCode }
        ]
      }
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const analytics = await aggregateAnalytics(shortUrl);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// GET /api/urls/:shortCode/qr
const getQrCode = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const shortUrl = await prisma.shortUrl.findFirst({
      where: {
        OR: [
          { shortCode },
          { customAlias: shortCode }
        ]
      }
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Generate QR code for the short redirection URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const redirectUrl = `${baseUrl}/${shortUrl.shortCode}`;

    const qrBuffer = await qr.toBuffer(redirectUrl, {
      type: 'png',
      width: 300,
      margin: 2,
    });

    res.setHeader('Content-Type', 'image/png');
    return res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUrlAnalytics,
  getPublicUrlStats,
  getQrCode,
};
