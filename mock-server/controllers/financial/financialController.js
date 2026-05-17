const { generateTodayTransactions } = require('../../config/seedToday');

let transactions = generateTodayTransactions();

const createTransaction = (req, res) => {
  const { type, amount, category, description, barberId, appointmentId, paymentMethod, date } = req.body;
  if (!type || !amount || !category || !description) {
    return res.status(400).json({ message: 'type, amount, category, description: Required' });
  }

  const transaction = {
    transactionId: `txn-${Date.now()}`,
    date: date || new Date().toISOString().split('T')[0],
    type,
    amount,
    category,
    description,
    barberId: barberId || undefined,
    appointmentId: appointmentId || undefined,
    paymentMethod: paymentMethod || undefined,
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  res.status(201).json({ transaction });
};

const listTransactions = (req, res) => {
  const { startDate, endDate, type, barberId } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });

  let result = transactions.filter(t => t.date >= startDate && t.date <= endDate);
  if (type) result = result.filter(t => t.type === type);
  if (barberId) result = result.filter(t => t.barberId === barberId);

  res.json({ transactions: result });
};

const getSummary = (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate are required' });

  const items = transactions.filter(t => t.date >= startDate && t.date <= endDate);
  const revenue = items.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amount, 0);
  const expenses = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const commissionsPaid = items.filter(t => t.type === 'commission_payment').reduce((s, t) => s + t.amount, 0);

  res.json({ summary: { startDate, endDate, revenue, expenses, commissionsPaid, profit: revenue - expenses - commissionsPaid, transactionCount: items.length } });
};

const getCommissions = (req, res) => {
  const { barberId, startDate, endDate } = req.query;
  if (!barberId || !startDate || !endDate) return res.status(400).json({ message: 'barberId, startDate, endDate required' });

  const commissionPercentage = 40; // default
  const items = transactions.filter(t => t.barberId === barberId && t.date >= startDate && t.date <= endDate);
  const revenueItems = items.filter(t => t.type === 'revenue');
  const totalRevenue = revenueItems.reduce((s, t) => s + t.amount, 0);
  const commissionAmount = totalRevenue * (commissionPercentage / 100);
  const paid = items.filter(t => t.type === 'commission_payment').reduce((s, t) => s + t.amount, 0);

  res.json({ barberId, commissionPercentage, totalRevenue, commissionAmount, paid, pending: commissionAmount - paid, transactions: revenueItems });
};

const payCommission = (req, res) => {
  const { barberId, amount, description } = req.body;
  if (!barberId || !amount) return res.status(400).json({ message: 'barberId and amount are required' });

  const transaction = {
    transactionId: `txn-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'commission_payment',
    amount,
    category: 'comissao',
    description: description || 'Pagamento de comissão',
    barberId,
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  res.json({ transaction });
};

module.exports = { createTransaction, listTransactions, getSummary, getCommissions, payCommission, getTransactionsStore: () => transactions, addTransaction: (t) => transactions.push(t) };
