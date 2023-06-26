const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./Public`);
  },
  filename: (req, file, cb) => {
    const fileName = `PIMG-${Date.now()}${Math.round(
      Math.random() * 10000000
    )}.${file.mimetype.split("/")[1]}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  switch (mimeType) {
    case "image/jpeg":
    case "image/png":
      if (file.size > 1 * 1000 * 1000) {
        cb(new Error("File size is too big"));
        return;
      }
      cb(null, true);
      break;
    default:
      cb(new Error("File format is not matched"));
      
  }
};

module.exports = multer({ storage, fileFilter });
