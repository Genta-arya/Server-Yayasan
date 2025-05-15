import Joi from "joi";

export const postBeritaSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    "string.base": `"judul" harus berupa string`,
    "string.min": `"judul" minimal terdiri dari 3 karakter`,
    "any.required": `"judul" diperlukan`,
  }),
  content: Joi.string().min(10).required().messages({
    "string.base": `"isi" harus berupa string`,
    "string.min": `"isi" minimal terdiri dari 10 karakter`,
    "any.required": `"isi" diperlukan`,
  }),
  kategori: Joi.string().required().messages({
    "string.base": `"kategori" harus berupa string`,
    "any.required": `"kategori" diperlukan`,
  }),
  author: Joi.string().messages({
    "string.base": `"author" harus berupa string`,
    "any.required": `"author" diperlukan`,
  }),
  thumbnail: Joi.string().uri().required().messages({
    "string.base": `"thumbnail" harus berupa string`,
    "string.uri": `"thumbnail" harus berupa URL yang valid`,
    "any.required": `"thumbnail" diperlukan`,
  }),
  isArsip: Joi.boolean().required().messages({
    "boolean.base": `"isArsip" harus berupa boolean`,
    "any.required": `"isArsip" diperlukan`,
  }),
});
