import { check } from "prisma";
import { prisma } from "../Config/Prisma.js";
import { deleteFileCloud } from "../Config/Service.js";

export const getDetailSpmb = async (req, res) => {
  try {
    const { type } = req.params;

    const { id } = req.query;

    const checckId = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    if (id) {
      if (!checckId) {
        return res.status(400).json({ message: "User tidak ditemukan" });
      }
    }

    if (!type) {
      return res.status(400).json({ message: "Type harus disertakan" });
    }

    let spmb;

    if (id) {
      spmb = await prisma.sPMB.findFirst({
        where: { type },
        include: {
          images: {
            orderBy: {
              order: "asc", // <--- ini bikin urut sesuai order
            },
          },
        },
      });
    } else {
      spmb = await prisma.sPMB.findFirst({
        where: { type, status: true },
        include: {
          images: {
            orderBy: {
              order: "asc", // <--- ini bikin urut sesuai order
            },
          },
        },
      });
    }

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
      where: {
        status: true,
      },
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
// pastiin ini path-nya bener ya

export const handleSpmb = async (req, res) => {
  try {
    const { judul, konten, type, imageUrls, icon_url, header, status } =
      req.body;
    if (!judul || !type || !Array.isArray(imageUrls)) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const existingSpmb = await prisma.sPMB.findUnique({
      where: { type },
      include: { images: true },
    });

    let spmb;

    if (existingSpmb) {
      const deleteFilenames = [];

      // 1. Hapus gambar lama yang tidak dipakai lagi
      const oldImageUrls = existingSpmb.images.map((img) => img.url);
      const unusedImageUrls = oldImageUrls.filter(
        (oldUrl) => !imageUrls.includes(oldUrl)
      );
      deleteFilenames.push(
        ...unusedImageUrls.map((url) => url.split("/").pop())
      );

      // 2. Hapus icon lama jika berubah
      if (existingSpmb.url_icon && existingSpmb.url_icon !== icon_url) {
        deleteFilenames.push(existingSpmb.url_icon.split("/").pop());
      }

      // 3. Hapus header lama jika berubah
      if (existingSpmb.header && existingSpmb.header !== header) {
        deleteFilenames.push(existingSpmb.header.split("/").pop());
      }

      // 4. Eksekusi hapus file dari cloud
      if (deleteFilenames.length > 0) {
        const result = await deleteFileCloud(deleteFilenames);
        console.log("✅ File dihapus dari cloud:", result);
      }

      // Hapus data images di DB
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
          status,
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
          status: true,
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
        data: spmb,
      });
    }
  } catch (error) {
    console.error("Gagal simpan/update SPMB:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
