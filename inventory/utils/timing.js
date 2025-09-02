/**
 * Waits a random duration between a and b (in miliseconds).
 *
 * @param   {number}  a  Start
 * @param   {number}  b  End
 */
exports.waitRandom = async function (a, b) {
  const start = a > b ? b : a;
  const end = a > b ? a : b;
  const diff = end - start;

  const duration = start + Math.random() * diff;
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(duration), duration);
  });
};
