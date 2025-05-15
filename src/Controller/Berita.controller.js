import { prisma } from "../Config/Prisma.js";
import { postBeritaSchema } from "../Library/Joi/Berita.validate.js";
import { formatJoiError } from "../Utils/FormatError.js";
import { sendError, sendResponse } from "../Utils/Response.js";

export const GetAllBerita = async (req, res) => {
  const { role } = req.body;

  try {
    let data;

    if (role === "admin") {
      data = await prisma.posting.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          kategori: true,
          author: true,
          isArsip: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      data = await prisma.posting.findMany({
        where: {
          isArsip: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          kategori: true,
          author: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    sendResponse(res, 200, "Success", data);
  } catch (error) {
    sendError(res, error);
  }
};

export const GetBeritaType = async (req, res) => {
  const { type } = req.params;
  const { limit } = req.query;

  try {
    const data = await prisma.posting.findMany({
      where: {
        kategori: type,
        isArsip: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        kategori: true,
        content: true,
        author: true,
        isArsip: true,
        createdAt: true,
        analytics: {
          select:{
            likes: true,
            unlikes: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }), // ini kunci opsional limit
    });

    sendResponse(res, 200, "Success", data);
  } catch (error) {
    sendError(res, error);
  }
};

export const PostBerita = async (req, res) => {
  const {
    title,
    content,
    thumbnail,
    kategori,
    author = "Yayasan Islammiyah Al-Jihad",
    isArsip,
  } = req.body;

  try {
    const { error } = postBeritaSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    const generatedSlug = `${year}-${month}-${day}-${
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Hapus karakter selain huruf, angka, spasi, dan dash
        .replace(/\s+/g, "-") // Ganti spasi dengan dash
        .replace(/-+/g, "-") // Ganti multiple dash jadi satu
        .replace(/^-+|-+$/g, "") // Hapus dash di awal/akhir
    }`;

    // check title

    const checkTitle = await prisma.posting.findFirst({
      where: {
        title: title,
      },
    });
    if (checkTitle) {
      return sendResponse(res, 400, "Judul sudah digunakan");
    }

    await prisma.posting.create({
      data: {
        title,
        content,
        thumbnail,
        kategori,
        author,
        isArsip: isArsip,
        slug: generatedSlug,
      },
    });

    sendResponse(res, 200, "Success");
  } catch (error) {
    sendError(res, error);
  }
};

export const EditBerita = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    content,
    thumbnail,
    kategori,
    author = "Yayasan Islammiyah Al-Jihad",
    isArsip,
  } = req.body;

  try {
    const { error } = postBeritaSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }

    const postinganLama = await prisma.posting.findUnique({
      where: { id },
    });

    if (!postinganLama) {
      return sendResponse(res, 404, "Postingan tidak ditemukan");
    }

    // Cek apakah ada postingan lain yang pakai judul sama
    const checkTitle = await prisma.posting.findFirst({
      where: {
        title,
        NOT: {
          id: id, // pastikan bukan dirinya sendiri
        },
      },
    });

    if (checkTitle) {
      return sendResponse(res, 400, "Judul sudah digunakan");
    }

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    const generatedSlug = `${year}-${month}-${day}-${
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Hapus karakter selain huruf, angka, spasi, dan dash
        .replace(/\s+/g, "-") // Ganti spasi dengan dash
        .replace(/-+/g, "-") // Ganti multiple dash jadi satu
        .replace(/^-+|-+$/g, "") // Hapus dash di awal/akhir
    }`;

    // Update postingan
    await prisma.posting.update({
      where: { id },
      data: {
        title,
        content,
        thumbnail,
        kategori,
        author,
        isArsip,
        slug: generatedSlug,
      },
    });

    sendResponse(res, 200, "Berhasil mengedit berita");
  } catch (error) {
    sendError(res, error);
  }
};

export const updateThumbnail = async (req, res) => {
  const { id } = req.params;
  const { thumbnail } = req.body;
  try {
    // check id
    const checkId = await prisma.posting.findUnique({
      where: {
        id: id,
      },
    });
    if (!checkId) {
      return sendResponse(res, 400, "Postingan tidak ditemukan");
    }
    await prisma.posting.update({
      where: {
        id: id,
      },
      data: {
        thumbnail: thumbnail,
      },
    });
    sendResponse(res, 200, "Success");
  } catch (error) {
    sendError(res, error);
  }
};

export const DeleteBerita = async (req, res) => {
  const { id } = req.params;
  try {
    // check id
    const checkId = await prisma.posting.findUnique({
      where: {
        id: id,
      },
    });
    if (!checkId) {
      return sendResponse(res, 400, "Postingan tidak ditemukan");
    }
    await prisma.posting.update({
      where: {
        id: id,
      },
      data: {
        isArsip: true,
      },
    });
    await prisma.posting.delete({
      where: {
        id: id,
      },
    });
    sendResponse(res, 200, "Success");
  } catch (error) {
    sendError(res, error);
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { isArsip } = req.body;
  try {
    // check id
    const checkId = await prisma.posting.findUnique({
      where: {
        id: id,
      },
    });
    if (!checkId) {
      return sendResponse(res, 400, "Postingan tidak ditemukan");
    }
    await prisma.posting.update({
      where: {
        id: id,
      },
      data: {
        isArsip: isArsip,
      },
    });
    sendResponse(res, 200, "Success");
  } catch (error) {
    sendError(res, error);
  }
};

export const getDetailBerita = async (req, res) => {
  const { id } = req.params;

  try {
    let postingan;

    if (id) {
      postingan = await prisma.posting.findUnique({
        where: { id },
      });
    } 
    else {
      return sendResponse(res, 400, "ID atau slug harus disertakan");
    }

    if (!postingan) {
      return sendResponse(res, 404, "Postingan tidak ditemukan");
    }

    sendResponse(res, 200, "Success", postingan);
  } catch (error) {
    sendError(res, error);
  }
};

export const getDetailBeritaSlug = async (req, res) => {
  const { slug } = req.params;

  console.log(slug);

  try {
    let postingan;

    postingan = await prisma.posting.findFirst({
      where: { slug },
    });

    if (!postingan) {
      return sendResponse(res, 400, "Postingan tidak ditemukan");
    }

    sendResponse(res, 200, "Success", postingan);
  } catch (error) {
    sendError(res, error);
  }
};
