import { prisma } from "../Config/Prisma.js";
import { sendError, sendResponse } from "../Utils/Response.js";
import { getClientIp } from 'request-ip';
export const createAnalytic = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return sendError(res, "Method not allowed", 405);
    }

    const { postingId } = req.body;

    if (!postingId) {
      return sendError(res, "postingId wajib diisi", 400);
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    // Cek apakah posting ada
    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
    });

    if (!posting) {
      return sendError(res, "Posting tidak ditemukan", 404);
    }

    // Cek atau buat Analytic
    let analytic = await prisma.analytic.findUnique({
      where: { postingId },
    });

    if (!analytic) {
      analytic = await prisma.analytic.create({
        data: {
          postingId,
          views: 0,
          likes: 0,
          avgIp: ip,
        },
      });
    }

    // Cek apakah IP + UserAgent sudah akses dalam 2 jam terakhir
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentLog = await prisma.viewLog.findFirst({
      where: {
        analyticId: analytic.id,
        ipAddress: ip,
        userAgent: userAgent,
        accessedAt: {
          gte: twoHoursAgo,
        },
      },
    });

    if (!recentLog) {
      // Tambah view +1
      await prisma.analytic.update({
        where: { id: analytic.id },
        data: {
          views: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Simpan log baru
      await prisma.viewLog.create({
        data: {
          analyticId: analytic.id,
          ipAddress: ip,
          userAgent,
          accessedAt: new Date(),
        },
      });
    }

    const analytics = await prisma.analytic.findUnique({
      where: { postingId },
    });

    return res.status(200).json({
      success: true,
      message: "Analytic diperbarui",
      data: {
        analytic: analytics,
      },
    });
  } catch (error) {
    console.error("Gagal create/update analytic:", error);
    return sendError(res, error);
  }
};

export const handleLike = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { postingId, type } = req.body;
    if (!postingId || !['like', 'unlike'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const ip = getClientIp(req) || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentAction = await prisma.likeLog.findFirst({
      where: {
        postingId,
        ipAddress: ip,
        userAgent,
        createdAt: { gte: twoHoursAgo },
      },
    });

    if (recentAction) {
      return res.status(400).json({
        success: false,
        message: 'Lo udah like/unlike dalam 2 jam terakhir 😎',
      });
    }

    const updateField = type === 'like' ? 'likes' : 'unlikes';

    await prisma.analytic.update({
      where: { postingId },
      data: {
        [updateField]: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    await prisma.likeLog.create({
      data: { postingId, ipAddress: ip, userAgent },
    });

    // Ambil data analytic terbaru setelah update
    const updatedAnalytic = await prisma.analytic.findUnique({
      where: { postingId },
    });

    return res.status(200).json({
      success: true,
      message: `${type} berhasil`,
      analytic: updatedAnalytic,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
