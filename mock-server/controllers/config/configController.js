const businessRules = require('../../config/businessRules');

// Get business rules configuration
const getBusinessRules = (req, res) => {
  console.log('GET /config/business-rules');
  res.json({ config: businessRules });
};

// Get specific rule category
const getRuleCategory = (req, res) => {
  const { category } = req.params;
  console.log(`GET /config/business-rules/${category}`);
  
  if (!businessRules[category]) {
    return res.status(404).json({ error: `Category '${category}' not found` });
  }
  
  res.json({ config: businessRules[category] });
};

module.exports = {
  getBusinessRules,
  getRuleCategory,
};
