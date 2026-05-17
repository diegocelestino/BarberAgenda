const { v4: uuidv4 } = require('uuid');

const SEED_CUSTOMERS = [
  { name: 'Lucas Ferreira', phone: '+5511987651234', email: 'lucas.f@email.com', totalVisits: 12, totalSpent: 540, loyaltyPoints: 54 },
  { name: 'Pedro Oliveira', phone: '+5511976543210', email: 'pedro.o@email.com', totalVisits: 8, totalSpent: 380, loyaltyPoints: 38 },
  { name: 'Rafael Costa', phone: '+5511965432109', email: 'rafael.c@email.com', totalVisits: 24, totalSpent: 1200, loyaltyPoints: 120 },
  { name: 'Bruno Lima', phone: '+5511954321098', email: '', totalVisits: 5, totalSpent: 200, loyaltyPoints: 20 },
  { name: 'Thiago Martins', phone: '+5511943210987', email: 'thiago.m@email.com', totalVisits: 15, totalSpent: 675, loyaltyPoints: 67 },
  { name: 'Gabriel Rocha', phone: '+5511932109876', email: '', totalVisits: 3, totalSpent: 120, loyaltyPoints: 12 },
  { name: 'Felipe Cardoso', phone: '+5511921098765', email: 'felipe.c@email.com', totalVisits: 31, totalSpent: 1550, loyaltyPoints: 155 },
  { name: 'Mateus Ribeiro', phone: '+5511910987654', email: 'mateus.r@email.com', totalVisits: 18, totalSpent: 810, loyaltyPoints: 81 },
  { name: 'André Souza', phone: '+5511998765432', email: '', totalVisits: 2, totalSpent: 80, loyaltyPoints: 8 },
  { name: 'Carlos Mendes', phone: '+5511987654321', email: 'carlos.m@email.com', totalVisits: 42, totalSpent: 2100, loyaltyPoints: 210 },
];

let customers = SEED_CUSTOMERS.map((c) => ({
  customerId: uuidv4(),
  ...c,
  notes: '',
  lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
}));

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
    customerId: uuidv4(),
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
