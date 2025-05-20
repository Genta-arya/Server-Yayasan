import { prisma } from "../Config/Prisma.js";

export const SliderHandle = async (req, res) => {
  const { imageUrls } = req.body;

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res
      .status(400)
      .json({ message: "Data tidak lengkap atau format salah" });
  }

  try {
    // Ambil semua slider
    const allSliders = await prisma.slider.findMany();

    let targetSliderId;

    if (allSliders.length > 0) {
      targetSliderId = allSliders[0].id;
    } else {
      const newSlider = await prisma.slider.create({ data: {} });
      targetSliderId = newSlider.id;
    }

    // Ambil semua image lama
    const existingImages = await prisma.imageSlider.findMany({
      where: { sliderId: targetSliderId },
    });

    const incomingIndexes = imageUrls.map((img) => img.index);

    // Hapus gambar yang tidak ada di data baru
    for (const oldImg of existingImages) {
      if (!incomingIndexes.includes(oldImg.index)) {
        await prisma.imageSlider.delete({
          where: { id: oldImg.id },
        });
      }
    }

    // Simpan/update gambar baru
    for (let i = 0; i < imageUrls.length; i++) {
      const { url, index } = imageUrls[i];

      const existing = await prisma.imageSlider.findFirst({
        where: { sliderId: targetSliderId, index },
      });

      if (existing) {
        await prisma.imageSlider.update({
          where: { id: existing.id },
          data: { url },
        });
      } else {
        await prisma.imageSlider.create({
          data: {
            url,
            index,
            sliderId: targetSliderId,
          },
        });
      }
    }

    return res.status(200).json({
      message: "Slider disimpan dan disinkronkan",
      sliderId: targetSliderId,
    });
  } catch (error) {
    console.error("Gagal simpan slider:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSlider = async (req, res) => {
  try {
    const sliders = await prisma.slider.findMany({
      include: {
        images: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });
    return res
      .status(200)
      .json({ message: "Berhasil ambil data", data: sliders });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleSambutan = async (req, res) => {
  const { konten, url } = req.body;

  if (!konten || !url) {
    return res
      .status(400)
      .json({ message: "Data tidak lengkap atau format salah" });
  }

  const checkData = await prisma.sambutan.findFirst();

  try {
    if (checkData) {
      try {
        const updateSambutan = await prisma.sambutan.update({
          where: { id: checkData.id },
          data: { konten, url_Image: url },
        });
        return res.status(200).json({
          message: "Sambutan berhasil diupdate",
          data: updateSambutan,
        });
      } catch (error) {
        console.error("Gagal update sambutan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      try {
        const newSambutan = await prisma.sambutan.create({
          data: { konten, url_Image: url },
        });
        return res
          .status(200)
          .json({ message: "Sambutan berhasil disimpan", data: newSambutan });
      } catch (error) {
        console.error("Gagal simpan sambutan:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  } catch (error) {
    console.error("Gagal simpan :", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetSambutan = async (req, res) => {
  try {
    const sambutan = await prisma.sambutan.findFirst();
    return res
      .status(200)
      .json({ message: "Berhasil ambil data", data: sambutan });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMetaData = async (req, res) => {
  try {
    // slider
    const sliders = await prisma.slider.findMany({
      include: {
        images: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });
    // sambutan
    const sambutan = await prisma.sambutan.findFirst();
    const unit = await prisma.unitPendidikan.findMany({
      orderBy: {
        order: "asc",
      },
    });

    const data = {
      sliders,
      sambutan,
      unit,
    };

    return res.status(200).json({ message: "Berhasil ambil data", data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleUnitPendidikan = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { units } = req.body;

    if (!units || !Array.isArray(units)) {
      return res.status(400).json({ message: "Invalid units data" });
    }

    // Ambil semua unit yang sudah ada di database
    const existingUnits = await prisma.unitPendidikan.findMany();
    const existingIds = existingUnits.map((unit) => unit.id);

    // Ambil semua id dari data yang dikirim frontend
    const incomingIds = units.map((unit) => unit.id).filter(Boolean);

    // Cari id yang harus dihapus (id yang ada di DB tapi gak dikirim dari frontend)
    const toDeleteIds = existingIds.filter((id) => !incomingIds.includes(id));

    // Hapus unit yang tidak ada di data terbaru
    if (toDeleteIds.length > 0) {
      await prisma.unitPendidikan.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    // loop & proses setiap unit (tambah / update)
    const results = await Promise.all(
      units.map(async (unit, index) => {
        if (!unit.id) {
          // ➕ Tambah unit baru
          return await prisma.unitPendidikan.create({
            data: {
              url_Image: unit.icon,
              judul: unit.title,
              deskripsi: unit.description,
              order: index,
            },
          });
        } else {
          // 🔄 Update unit yang sudah ada
          return await prisma.unitPendidikan.update({
            where: { id: unit.id },
            data: {
              url_Image: unit.icon,
              judul: unit.title,
              deskripsi: unit.description,
              order: index,
            },
          });
        }
      })
    );

    return res
      .status(200)
      .json({ message: "Berhasil disimpan", data: results });
  } catch (error) {
    console.error("Gagal simpan unit:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUnitPendidikan = async (req, res) => {
  try {
    const units = await prisma.unitPendidikan.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return res
      .status(200)
      .json({ message: "Berhasil ambil data", data: units });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
