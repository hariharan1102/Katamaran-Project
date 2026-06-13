const crypto = require('crypto');
const prisma = require('../config/db');
const Papa = require('papaparse');

// Helper to validate URL
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// Helper to generate a 6-char random alphanumeric string
const generateShortCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return result;
};

// Helper to get unique short code
const getUniqueShortCode = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateShortCode(6);
    const existing = await prisma.shortUrl.findFirst({
      where: {
        OR: [
          { shortCode: code },
          { customAlias: code }
        ]
      }
    });
    if (!existing) return code;
    attempts++;
  }
  throw new Error('Failed to generate a unique short code');
};

// POST /api/urls
const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
    }

    let shortCode;
    let alias = null;

    if (customAlias) {
      // Validate alias format (alphanumeric, -, _)
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(customAlias)) {
        return res.status(400).json({ error: 'Custom alias can only contain letters, numbers, hyphens (-) and underscores (_)' });
      }
      if (customAlias.length < 3 || customAlias.length > 30) {
        return res.status(400).json({ error: 'Custom alias must be between 3 and 30 characters' });
      }

      // Check if custom alias is already used
      const existing = await prisma.shortUrl.findFirst({
        where: {
          OR: [
            { shortCode: customAlias },
            { customAlias: customAlias }
          ]
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Custom alias is already taken' });
      }

      shortCode = customAlias;
      alias = customAlias;
    } else {
      shortCode = await getUniqueShortCode();
    }

    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry date format' });
      }
      if (parsedExpiry <= new Date()) {
        return res.status(400).json({ error: 'Expiry date must be in the future' });
      }
    }

    const shortUrl = await prisma.shortUrl.create({
      data: {
        originalUrl,
        shortCode,
        customAlias: alias,
        expiresAt: parsedExpiry,
        userId,
      },
    });

    return res.status(201).json(shortUrl);
  } catch (error) {
    next(error);
  }
};

// GET /api/urls
const listUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const urls = await prisma.shortUrl.findMany({
      where: { userId },
      include: {
        _count: {
          select: { visits: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format output
    const formattedUrls = urls.map(url => ({
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
      clicks: url._count.visits,
    }));

    return res.json(formattedUrls);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/urls/:id
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await prisma.shortUrl.findUnique({
      where: { id },
    });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (url.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this URL' });
    }

    await prisma.shortUrl.delete({
      where: { id },
    });

    return res.json({ message: 'Short URL deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/urls/:id
const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;
    const userId = req.user.id;

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
    }

    const url = await prisma.shortUrl.findUnique({
      where: { id },
    });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (url.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this URL' });
    }

    const updatedUrl = await prisma.shortUrl.update({
      where: { id },
      data: { originalUrl },
    });

    return res.json(updatedUrl);
  } catch (error) {
    next(error);
  }
};

// POST /api/urls/bulk
const bulkShorten = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    const csvData = req.file.buffer.toString('utf8');
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data;
    const results = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const originalUrl = row.originalUrl || row.Url || row.url;
      const customAlias = row.customAlias || row.alias || row.Alias;
      const expiresAtStr = row.expiresAt || row.expiry || row.Expiry;

      if (!originalUrl) {
        errors.push({ row: i + 1, error: 'originalUrl column is missing or empty' });
        continue;
      }

      if (!isValidUrl(originalUrl)) {
        errors.push({ row: i + 1, url: originalUrl, error: 'Invalid URL format' });
        continue;
      }

      let shortCode;
      let alias = null;

      if (customAlias) {
        const aliasRegex = /^[a-zA-Z0-9-_]+$/;
        if (!aliasRegex.test(customAlias) || customAlias.length < 3 || customAlias.length > 30) {
          errors.push({ row: i + 1, url: originalUrl, error: `Invalid custom alias '${customAlias}'` });
          continue;
        }

        // Check if custom alias is already used
        const existing = await prisma.shortUrl.findFirst({
          where: {
            OR: [
              { shortCode: customAlias },
              { customAlias: customAlias }
            ]
          }
        });

        if (existing) {
          errors.push({ row: i + 1, url: originalUrl, error: `Alias '${customAlias}' is already taken` });
          continue;
        }

        shortCode = customAlias;
        alias = customAlias;
      } else {
        try {
          shortCode = await getUniqueShortCode();
        } catch (err) {
          errors.push({ row: i + 1, url: originalUrl, error: 'Failed to generate short code' });
          continue;
        }
      }

      let expiresAt = null;
      if (expiresAtStr) {
        const parsedExpiry = new Date(expiresAtStr);
        if (!isNaN(parsedExpiry.getTime()) && parsedExpiry > new Date()) {
          expiresAt = parsedExpiry;
        }
      }

      try {
        const shortUrl = await prisma.shortUrl.create({
          data: {
            originalUrl,
            shortCode,
            customAlias: alias,
            expiresAt,
            userId: req.user.id,
          },
        });
        results.push(shortUrl);
      } catch (err) {
        errors.push({ row: i + 1, url: originalUrl, error: err.message });
      }
    }

    return res.status(201).json({
      message: `Successfully processed CSV. Shortened ${results.length} URLs.`,
      successCount: results.length,
      errorCount: errors.length,
      shortUrls: results,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  listUrls,
  deleteUrl,
  updateUrl,
  bulkShorten,
};
