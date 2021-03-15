// Hàm check xem dữ liệu truyền vào có đúng với type quy định hay không. Nếu đúng thì
//return true, nếu có bất kì key nào bị khác type thì trả về false

// types: string, number, boolean, object, array

const isKeysTypeCorrect = (keyType, object) => {
  let allValid = true;
  if (typeof keyType === "string") {
    for (const item in object) {
      if (typeof object[item] !== keyType) {
        allValid = false;
        break;
      }
    }
  } else {
    for (const item in keyType) {
      if (
        (Array.isArray(object[item]) && keyType[item] !== "array") ||
        typeof object[item] !== keyType[item]
      ) {
        allValid = false;
        break;
      }
    }
  }

  return allValid;
};

module.exports = isKeysTypeCorrect;
