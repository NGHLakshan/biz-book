export const exportToCSV = (transactions, yearMonth = null) => {
  let filtered = transactions;
  
  if (yearMonth && yearMonth !== 'all') {
    const [year, month] = yearMonth.split('-');
    filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === parseInt(year, 10) && (d.getMonth() + 1) === parseInt(month, 10);
    });
  }

  if (!filtered || filtered.length === 0) {
    return false;
  }

  // Define headers
  const headers = ['Date', 'Time', 'Type', 'Category', 'SubCategory', 'Amount', 'Payment Method', 'Description'];
  
  // Format rows
  const rows = filtered.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.time || '',
    t.type || '',
    t.category || '',
    t.subCategory || '',
    t.amount || 0,
    t.paymentMethod || '',
    `"${(t.description || '').replace(/"/g, '""')}"` // Escape quotes for CSV
  ]);

  // Combine into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${yearMonth && yearMonth !== 'all' ? yearMonth : 'all'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};
