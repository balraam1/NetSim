// Placeholder for device name generation
const adjectives = ['Swift', 'Brave', 'Clever', 'Mighty', 'Gentle'];
const nouns = ['Lion', 'Eagle', 'Wolf', 'Bear', 'Fox'];

function generateDeviceName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
}

module.exports = { generateDeviceName };
