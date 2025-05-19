export const deleteFileCloud = async (filenames) => {
  const url = "https://cloud.mystorages.my.id/delete.php";
  const headers = {
    "Content-Type": "application/json",
    genta: "Genta@456",
  };

  // Format data: string → array (biar seragam)
  const data = Array.isArray(filenames)
    ? { filenames }
    : { filename: filenames }; // 1 file saja

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal hapus file");
    }

    // ✅ Log ketika berhasil
    console.log("✅ File berhasil dihapus dari cloud:", result);

    return {
      success: true,
      message: result.message || "File berhasil dihapus",
      raw: result,
    };
  } catch (error) {
    console.error("❌ Gagal hapus file dari cloud:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};
