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
            index: "asc", // urut dari paling kecil ke besar
          },
        },
      },
    });

    // await prisma.imageSlider.deleteMany();
    // await prisma.slider.deleteMany();

    return res
      .status(200)
      .json({ message: "Berhasil ambil data", data: sliders });
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
            index: "asc", // urut dari paling kecil ke besar
          },
        },
      },
    });

    const data = {
      sliders,
    };

    return res.status(200).json({ message: "Berhasil ambil data", data: data });
  } catch (error) {}
};
