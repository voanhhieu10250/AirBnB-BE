const multer = require("multer");
const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");

const uploadCallBack = multer({
  storage: multer.diskStorage({
    destination: "images",
    filename(req, file, done) {
      let name = null;
      if (req.user)
        name =
          Date.now() +
          "-" +
          req.user.username +
          file.originalname.slice(file.originalname.lastIndexOf("."));
      else name = Date.now() + "-" + file.originalname.replace(/ /g, "-");

      done(null, name);
    },
  }),
});

const upload = (multerCallBack) => (req, res, next) => {
  multerCallBack(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === "LIMIT_UNEXPECTED_FILE")
        return generateMessage("Quantity limit error.", res);
      else return devError(err, res, "Something went wrong. Please try again.");
    } else if (err) {
      // An unknown error occurred when uploading.
      return devError(err, res, "Something went wrong. Please try again.");
    }
    next();
  });
};

module.exports = { upload, uploadCallBack };
