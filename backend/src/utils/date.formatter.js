function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}

module.exports = {
  formatTimestamp,
  formatDate,
  formatTime
};
