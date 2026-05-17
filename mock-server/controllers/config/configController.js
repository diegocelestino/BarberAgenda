const { getConfig, updateConfig } = require('../../config/businessRules');

const getBusinessRules = (req, res) => {
  res.json(getConfig());
};

const getRuleCategory = (req, res) => {
  const { category } = req.params;
  const config = getConfig();
  if (!config[category]) {
    return res.status(404).json({ error: `Category '${category}' not found` });
  }
  res.json({ config: config[category] });
};

const updateBusinessRules = (req, res) => {
  const updated = updateConfig(req.body);
  res.json(updated);
};

module.exports = { getBusinessRules, getRuleCategory, updateBusinessRules };
