function isNumericString(str) {
  return /^\d+$/.test(str);
}

module.exports = { isNumericString };