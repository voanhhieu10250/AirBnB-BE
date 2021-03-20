const isValidGroup = (group = "") => {
  const regex = /^gp(0[0-9]|1[0-5])$/i;
  if (typeof group !== "string" || !regex.test(group)) return false;
  return true;
};

module.exports = isValidGroup;
