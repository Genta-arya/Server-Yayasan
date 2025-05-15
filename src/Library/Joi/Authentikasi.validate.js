import Joi from "joi";

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.base": `"username" harus berupa string`,

    "any.required": `"username" Tidak boleh kosong`,
  }),
  password: Joi.string().required().messages({
    "string.base": `"password" harus berupa string`,

    "any.required": `"password" Tidak boleh kosong`,
  }),
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    "string.base": `"username" harus berupa string`,
    "string.min": `"username" minimal terdiri dari 3 karakter`,

    "any.required": `"username" Tidak boleh kosong`,
  }),
  email: Joi.string().email().required().messages({
    "string.base": `"email" harus berupa string`,
    "string.email": `"email" harus dalam format yang valid`,
    "any.required": `"email" Tidak boleh kosong`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": `"password" harus berupa string`,
    "string.min": `"password" minimal terdiri dari 6 karakter`,
    "any.required": `"password" Tidak boleh kosong`,
  }),
});

const tokenSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.base": `"token" harus berupa string`,
    "any.required": `"token" Tidak boleh kosong`,
  }),
});

export { loginSchema, registerSchema, tokenSchema };
