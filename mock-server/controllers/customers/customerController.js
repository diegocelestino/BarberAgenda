let customers = [];

const listCustomers = (req, res) => {
  const search = req.query.search?.toLowerCase();
  let result = customers;
  if (search) {
    result = customers.filter(c =>
      c.name.toLowerCase().includes(search) || c.phone.includes(search)
    );
  }
  res.json({ customers: result });
};

const getCustomer = (req, res) => {
  const customer = customers.find(c => c.customerId === req.params.customerId);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json({ customer });
};

const getByPhone = (req, res) => {
  const customer = customers.find(c => c.phone === req.params.phone) || null;
  res.json({ customer });
};

const createCustomer = (req, res) => {
  const { name, phone, email, notes } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'name, phone: Required' });

  const customer = {
    customerId: `cust-${Date.now()}`,
    name,
    phone,
    email: email || undefined,
    notes: notes || undefined,
    loyaltyPoints: 0,
    totalVisits: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };
  customers.push(customer);
  res.status(201).json({ customer });
};

const updateCustomer = (req, res) => {
  const idx = customers.findIndex(c => c.customerId === req.params.customerId);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  const { name, phone, email, notes, loyaltyPoints } = req.body;
  if (name !== undefined) customers[idx].name = name;
  if (phone !== undefined) customers[idx].phone = phone;
  if (email !== undefined) customers[idx].email = email;
  if (notes !== undefined) customers[idx].notes = notes;
  if (loyaltyPoints !== undefined) customers[idx].loyaltyPoints = loyaltyPoints;

  res.json({ customer: customers[idx] });
};

const deleteCustomer = (req, res) => {
  const idx = customers.findIndex(c => c.customerId === req.params.customerId);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });
  customers.splice(idx, 1);
  res.json({ message: 'Customer deleted' });
};

module.exports = { listCustomers, getCustomer, getByPhone, createCustomer, updateCustomer, deleteCustomer };
