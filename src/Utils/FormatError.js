
export const formatJoiError = (error) => {
  return error.details.map((detail) =>
    detail.message.replace(/\\"/g, '"').replace(/\\'/g, "'")
  );
};
