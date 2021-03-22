// Hàm kiểm tra và trả về list các key có value rỗng (kể cả các key có value là Array
//rỗng hoặc Object rỗng) bên trong obj

const getEmptyKeys = (obj) => {
  const listEmptyKeys = [];
  for (const item in obj) {
    if (!obj[item] && obj[item] !== 0) {
      listEmptyKeys.push(item);
    } else if (Array.isArray(obj[item]) && obj[item].length === 0) {
      listEmptyKeys.push(item);
    } else if (
      typeof obj[item] === "object" &&
      Object.getOwnPropertyNames(obj[item]).length === 0
    ) {
      listEmptyKeys.push(item);
    }
  }
  return listEmptyKeys;
};

module.exports = getEmptyKeys;
