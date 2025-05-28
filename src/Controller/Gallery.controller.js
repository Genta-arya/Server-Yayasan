import { prisma } from "../Config/Prisma.js";

export const GalleryHandle = async (req, res) => {
  const { galleries } = req.body;

  if (!Array.isArray(galleries) || galleries.length === 0) {
    return res
      .status(400)
      .json({ message: "Data tidak lengkap atau format salah." });
  }

  try {
    // Ambil semua id dari data baru
    const incomingIds = galleries
      .filter((g) => g.id) // ambil yg udah ada id-nya
      .map((g) => g.id);

    // Hapus semua record lama yang ID-nya gak ada di data baru
    await prisma.gallery.deleteMany({
      where: {
        NOT: {
          id: { in: incomingIds },
        },
      },
    });

    // Proses update/insert satu per satu
    let galleryData = {};
    for (const item of galleries) {
      const { id, url_image, order } = item;

      if (id) {
        // Cek kalau ada, update
        galleryData = await prisma.gallery.update({
          where: { id },
          data: { url_image, order },
        });
      } else {
        // Kalau gak ada id, insert baru
        galleryData = await prisma.gallery.create({
          data: {
            url_image,
            order,
            createdAt: new Date(),
          },
        });
      }
    }

    return res
      .status(200)
      .json({ message: "Galeri berhasil disinkronkan.", data: galleryData });
  } catch (error) {
    console.error("Gagal sinkronisasi galeri:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan galeri." });
  }
};

export const getGallery = async (req, res) => {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { order: "asc" },
    });
    return res
      .status(200)
      .json({ message: "Berhasil ambil galeri", data: galleries });
  } catch (error) {
    console.error("Gagal mengambil galeri:", error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil galeri." });
  }
};
