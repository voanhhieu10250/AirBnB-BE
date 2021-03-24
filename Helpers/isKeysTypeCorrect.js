// Hàm check xem dữ liệu truyền vào có đúng với type quy định hay không. Nếu đúng thì
//return true, nếu có bất kì key nào bị khác type thì trả về false

// types: string, number, boolean, object, array, null

const isKeysTypeCorrect = (keyType, object, strictModeForEmptyKey = false) => {
  let allValid = true;
  if (typeof keyType === "string") {
    for (const item in object) {
      if (object[item] === undefined && !strictModeForEmptyKey) continue;
      if (!isNaN(Number(object[item])) && keyType === "number") continue;
      if (
        (object[item] === null && keyType !== "null") ||
        typeof object[item] !== keyType
      ) {
        allValid = false;
        console.log(`Type error at keyType "${keyType}" for ${item}`);
        break;
      }
    }
  } else {
    for (const item in keyType) {
      if (object[item] === undefined && !strictModeForEmptyKey) continue;
      if (!isNaN(Number(object[item])) && keyType[item] === "number") continue;
      if (
        (object[item] === null && keyType[item] !== "null") ||
        (Array.isArray(object[item]) && keyType[item] !== "array") ||
        typeof object[item] !== keyType[item]
      ) {
        allValid = false;
        console.log(`Type error at keyType "${keyType[item]}" for ${item}`);
        break;
      }
    }
  }

  return allValid;
};

module.exports = isKeysTypeCorrect;
