module.exports = {
  convertFromDBtoRealPath(dbvalue) {
    return `${process.env.BE_BASEPATH}${dbvalue}`;
  },
  setFromFileNameToDBValue(filename) {
    return `/static/${filename}`;
  },
  getFilenameFromDbValue(dbValue) {
    const split = dbValue.split("/");
    if (split.length < 3) {
      return "";
    }
    return split[2];
  },
  getAbsolutePathPublicFile(filename) {
    return `${__dirname}/../Public/${filename}`;
  },
};
