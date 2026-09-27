function translate(lits, ...vals) {
  if (typeof lits === 'string') {
    return lits;
  }
  if (lits && lits.raw) {
    let result = lits.raw[0] ?? '';
    for (let i = 0; i < vals.length; i++) {
      result += String(vals[i]) + (lits.raw[i + 1] ?? '');
    }
    return result;
  }
  return '';
}

module.exports = {
  t: translate,
  plural: translate,
  select: translate,
  selectOrdinal: translate,
  defineMessage: descriptor => descriptor,
};
