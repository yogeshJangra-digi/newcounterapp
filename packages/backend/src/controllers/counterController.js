// In-memory counter
let counter = 0;

// Controller methods
exports.getCounter = (req, res) => {
  res.json({ value: counter });
};

exports.incrementCounter = (req, res) => {
  counter += 57;
  res.json({ value: counter });
};

exports.decrementCounter = (req, res) => {
  counter -= 1;
  res.json({ value: counter });
};

exports.resetCounter = (req, res) => {
  counter = 0;
  res.json({ value: counter });
};
