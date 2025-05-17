import { prisma } from "../Config/Prisma.js";

export const getDetailSpmb = async (req, res) => {
  try {
    const { type } = req.params; // atau req.params kalau pakai route param

    if (!type) {
      return res.status(400).json({ message: "Type harus disertakan" });
    }

    const spmb = await prisma.sPMB.findFirst({
      where: { type },
      include: {
        images: {
          orderBy: {
            order: "asc", // <--- ini bikin urut sesuai order
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Berhasil ambil detail", data: spmb });
  } catch (error) {
    console.error("Gagal ambil detail SPMB:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getSpmbData = async (req, res) => {
  try {
    const data = await prisma.sPMB.findMany({
      select: {
        url_icon: true,
        type: true,
        judul: true,
      },
    });
    return res.status(200).json({ message: "Berhasil ambil data", data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const handleSpmb = async (req, res) => {
  try {
    const { judul, konten, type, imageUrls, icon_url, header } = req.body;
    console.log(req.body);
    if (!judul || !type || !Array.isArray(imageUrls)) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Cek apakah SPMB dengan type ini udah ada
    const existingSpmb = await prisma.sPMB.findUnique({
      where: { type },
      include: { images: true },
    });
    console.log(existingSpmb);

    let spmb;

    if (existingSpmb) {
      // Hapus semua images lama dulu biar diganti
      await prisma.image.deleteMany({
        where: { spmbId: existingSpmb.id },
      });

      // Update data
      spmb = await prisma.sPMB.update({
        where: { id: existingSpmb.id },
        data: {
          judul,
          konten,
          header,
          url_icon: icon_url,
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              order: index,
            })),
          },
        },
        include: {
          images: true,
        },
      });

      return res.status(200).json({
        message: "SPMB berhasil diupdate",
        data: spmb,
      });
    } else {
      // Buat baru
      spmb = await prisma.sPMB.create({
        data: {
          judul,
          konten,
          header,
          url_icon: icon_url,
          type,
          images: {
            create: imageUrls.map((url) => ({
              url,
            })),
          },
        },
        include: {
          images: true,
        },
      });

      return res.status(201).json({
        message: "SPMB berhasil disimpan",
        // data: spmb,
      });
    }
  } catch (error) {
    console.error("Gagal simpan/update SPMB:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
