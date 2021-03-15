// Hàm kiểm tra và trả về list các key có value rỗng bên trong obj

const checkFilled = (obj) => {
  const listEmptyKeys = [];
  for (const item in obj) {
    if (!obj[item]) {
      listEmptyKeys.push(item);
    }
  }
  return listEmptyKeys;
};

module.exports = checkFilled;
