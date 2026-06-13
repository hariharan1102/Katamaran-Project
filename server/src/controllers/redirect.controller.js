const UAParser = require('ua-parser-js');
const prisma = require('../config/db');

// Helper to check if IP is local/private
const isLocalIp = (ip) => {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') // wait, simple startsWith matches class B private IP range
  );
};

// Async helper to get country from IP address
const getCountryFromIp = async (ip) => {
  if (!ip || isLocalIp(ip)) {
    return 'Local / Unknown';
  }
  
  try {
    // Set a timeout of 1000ms using AbortController to avoid blocking redirect
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000);
    
    const response = await fetch(`http://ip-api.com/json/${ip}`, { signal: controller.signal });
    clearTimeout(id);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success') {
        return data.country || 'Unknown';
      }
    }
  } catch (err) {
    console.error('IP Country Lookup Error:', err.message);
  }
  return 'Unknown';
};

// GET /:shortCode
const handleRedirect = async (req, res, next) => {
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
      return res.status(404).send('<h1>Link Not Found</h1><p>The shortened link you are trying to reach does not exist.</p>');
    }

    // Check expiry
    if (shortUrl.expiresAt && new Date(shortUrl.expiresAt) < new Date()) {
      return res.status(410).send('<h1>Link Expired</h1><p>This link has expired and is no longer available (410 Gone).</p>');
    }

    // Gather request information
    const userAgent = req.headers['user-agent'] || '';
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }

    // Parse User-Agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    let device = parser.getDevice().type || 'Desktop';
    // Capitalize first letter of device type
    device = device.charAt(0).toUpperCase() + device.slice(1);

    // Get country and record the visit in background so we don't slow down the redirect
    getCountryFromIp(ipAddress).then(async (country) => {
      try {
        await prisma.visit.create({
          data: {
            shortUrlId: shortUrl.id,
            ipAddress,
            userAgent,
            browser,
            device,
            country,
          },
        });
      } catch (dbErr) {
        console.error('Failed to log visit to database:', dbErr.message);
      }
    });

    // 302 Redirect to original URL
    return res.redirect(shortUrl.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRedirect,
};
