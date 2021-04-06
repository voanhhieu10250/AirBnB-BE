const config = require("config");
const fs = require("fs");
const generateMessage = require("../Helpers/generateMessage");

//----------------------------------------------------------------

const uploadFile = async (req, res) => {
  const imagesName = req.files.photos.map(
    (item) => `http://${config.get("hostUrl")}/image/${item.filename}`
  );
  return generateMessage("Upload successfully", res, 200, { imagesName });
  // res.send(`http://${config.get("hostUrl")}/image/${req.file.filename}`);
  // res.send({ files: req.files, body: req.body });
};

const imagesFolderPath = "./images/";
const getListImages = async (req, res) => {
  const listFiles = [];
  fs.readdirSync(imagesFolderPath).forEach((file) => {
    listFiles.push(`http://${config.get("hostUrl")}/image/${file}`);
  });
  res.send({ items: listFiles });
};

const deleteImage = async (req, res) => {
  const { imageName } = req.query;
  if (imagesName.indexOf(".") === -1)
    return generateMessage(
      "Please enter file extension (*.png, *.jpg,...)",
      res,
      406
    );
  const index = fs.readdirSync(imagesFolderPath).indexOf(imageName);
  if (index === -1)
    return generateMessage("This image does not exist.", res, 404);
  fs.unlinkSync(`./images/${imageName}`);
  res.send({ message: "Delete successfuly" });
};

module.exports = {
  uploadFile,
  getListImages,
  deleteImage,
};
