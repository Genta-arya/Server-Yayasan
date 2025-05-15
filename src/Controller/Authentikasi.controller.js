import { prisma } from "../Config/Prisma.js";
import {
  loginSchema,
  registerSchema,
  tokenSchema,
} from "../Library/Joi/Authentikasi.validate.js";
import { createToken } from "../Library/Jwt/CreateToken.js";
import { formatJoiError } from "../Utils/FormatError.js";
import { sendError, sendResponse } from "../Utils/Response.js";
import bcrypt from "bcryptjs";
export const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }

    const findUser = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!findUser) {
      return sendResponse(res, 400, "Username atau password salah");
    }
    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return sendResponse(res, 400, "Username atau password salah");
    }
    const token = createToken({ id: findUser.id, role: findUser.role });

    if (findUser.token) {
      await prisma.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          status_login: true,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          token: token,
          status_login: true,
        },
      });
    }
    const findUserUpdate = await prisma.user.findFirst({
      where: {
        id: findUser.id,
      },
    });

    sendResponse(res, 200, "Login berhasil", { token: findUserUpdate.token });
  } catch (error) {
    sendError(res, error);
  }
};

export const handleRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }

    const findUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (findUser) {
      return sendResponse(res, 400, "Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username: username,
        email: email,
        role: "admin",
        avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        password: hashedPassword,
      },
    });

    sendResponse(res, 200, "Registrasi berhasil");
  } catch (error) {
    sendError(res, error);
  }
};

export const Session = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendResponse(res, 409, "Silahkan login terlebih dahulu");
  }

  try {
    const { error } = tokenSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }

    const findUser = await prisma.user.findFirst({
      where: { token },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        status_login: true,
        token: true,
      },
    });

    if (!findUser) {
      return sendResponse(res, 409, "Silahkan login terlebih dahulu");
    }

    sendResponse(res, 200, "Success", findUser);
  } catch (error) {
    const findUsers = await prisma.user.findFirst({
      where: { token },
      select: {
        id: true,
      },
    });
    if (!findUsers) {
      return sendResponse(res, 409, "Silahkan login terlebih dahulu");
    }
    if (error instanceof jwt.TokenExpiredError) {
      await prisma.user.update({
        where: { id: findUsers.id },
        data: { status_login: false, token: null },
      });
      return sendResponse(res, 409, "Token telah kedaluwarsa");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      await prisma.user.update({
        where: { id: findUsers.id },
        data: { status_login: false, token: null },
      });
      return sendResponse(res, 409, "Token tidak valid atau format salah");
    }
    return sendError(res, error);
  }
};

export const Logout = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return sendResponse(res, 409, "Silahkan login terlebih dahulu");
  }
  try {
    const { error } = tokenSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, 400, formatJoiError(error));
    }
    const findUser = await prisma.user.findFirst({
      where: { token },
    });
    if (!findUser) {
      return sendResponse(res, 409, "Silahkan login terlebih dahulu");
    }
    await prisma.user.update({
      where: { id: findUser.id },
      data: { status_login: false, token: null },
    });
    sendResponse(res, 200, "Logout berhasil");
  } catch (error) {
    sendError(res, error);
  }
};
