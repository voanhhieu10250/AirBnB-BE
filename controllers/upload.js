const config = require("config");
const generateMessage = require("../Helpers/generateMessage");

const uploadFile = async (req, res) => {
  const imagesName = req.files.photos.map(
    (item) => `http://${config.get("hostUrl")}/image/${item.filename}`
  );
  return generateMessage("Upload thành công", res, undefined, { imagesName });
  // res.send(`http://${config.get("hostUrl")}/image/${req.file.filename}`);
  // res.send({ files: req.files, body: req.body });
};

module.exports = {
  uploadFile,
};
