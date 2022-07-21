/**
 *
 * @param {number} t
 * @returns
 */
function delay (t = 0) {
  return new Promise(resolve => setTimeout(resolve, t))
}

module.exports = {
  delay
}
