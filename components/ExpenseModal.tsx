'use client';

import React, { useState, useEffect } from 'react';

interface Participant {
  id: string;
  name: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: any) => void;
  participants: Participant[];
  editingExpense?: any;
  currency: string;
}

const CATEGORIES = [
  'Food',
  'Accommodation',
  'Transport',
  'Activities',
  'Shopping',
  'Other',
];

export default function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  participants,
  editingExpense,
  currency,
}: ExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxPercent, setTaxPercent] = useState('');
  const [tipPercent, setTipPercent] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [selectedForSplit, setSelectedForSplit] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount);
      setPayerId(editingExpense.payerId);
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      setDate(new Date(editingExpense.date).toISOString().split('T')[0]);
      setTaxPercent(editingExpense.taxPercent || '');
      setTipPercent(editingExpense.tipPercent || '');
      setSplitType(editingExpense.splitType);

      if (editingExpense.splitType === 'SELECTED_EQUAL') {
        setSelectedForSplit(Object.keys(editingExpense.splitDetails || {}));
      } else if (editingExpense.splitType === 'CUSTOM_AMOUNTS') {
        setCustomAmounts(editingExpense.splitDetails || {});
      } else if (editingExpense.splitType === 'PERCENTAGES') {
        setPercentages(editingExpense.splitDetails || {});
      }
    } else {
      resetForm();
    }
  }, [editingExpense, isOpen]);

  const resetForm = () => {
    setAmount('');
    setPayerId(participants[0]?.id || '');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTaxPercent('');
    setTipPercent('');
    setSplitType('EQUAL');
    setSelectedForSplit([]);
    setCustomAmounts({});
    setPercentages({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData: any = {
      amount: parseFloat(amount),
      payerId,
      category,
      description,
      date: new Date(date),
      splitType,
    };

    if (taxPercent) expenseData.taxPercent = parseFloat(taxPercent);
    if (tipPercent) expenseData.tipPercent = parseFloat(tipPercent);

    if (splitType === 'SELECTED_EQUAL') {
      expenseData.splitDetails = selectedForSplit.reduce(
        (acc, id) => {
          acc[id] = 0; // will be calculated server-side
          return acc;
        },
        {} as Record<string, number>
      );
    } else if (splitType === 'CUSTOM_AMOUNTS') {
      expenseData.splitDetails = customAmounts;
    } else if (splitType === 'PERCENTAGES') {
      expenseData.splitDetails = percentages;
    }

    onSubmit(expenseData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span className="text-gray-600">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6 text-black">
          {/* Amount & Payer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paid By
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select person</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What was this for?"
            />
          </div>

          {/* Tax & Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tax (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tip (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Split Type
            </label>
            <div className="space-y-2">
              {['EQUAL', 'SELECTED_EQUAL', 'CUSTOM_AMOUNTS', 'PERCENTAGES'].map(
                (type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="splitType"
                      value={type}
                      checked={splitType === type}
                      onChange={(e) => setSplitType(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">
                      {type === 'EQUAL'
                        ? 'Equal among all'
                        : type === 'SELECTED_EQUAL'
                        ? 'Equal among selected'
                        : type === 'CUSTOM_AMOUNTS'
                        ? 'Custom amounts'
                        : 'Percentages'}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Split Details */}
          {(splitType === 'SELECTED_EQUAL' ||
            splitType === 'CUSTOM_AMOUNTS' ||
            splitType === 'PERCENTAGES') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {splitType === 'CUSTOM_AMOUNTS'
                  ? 'Custom Amounts'
                  : splitType === 'PERCENTAGES'
                  ? 'Percentages (%)'
                  : 'Selected Participants'}
              </label>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    {splitType === 'SELECTED_EQUAL' ? (
                      <>
                        <input
                          type="checkbox"
                          checked={selectedForSplit.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForSplit([...selectedForSplit, p.id]);
                            } else {
                              setSelectedForSplit(
                                selectedForSplit.filter((id) => id !== p.id)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-700">{p.name}</label>
                      </>
                    ) : (
                      <>
                        <label className="text-sm text-gray-700 w-24">
                          {p.name}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={
                            splitType === 'CUSTOM_AMOUNTS'
                              ? customAmounts[p.id] || ''
                              : percentages[p.id] || ''
                          }
                          onChange={(e) => {
                            if (splitType === 'CUSTOM_AMOUNTS') {
                              setCustomAmounts({
                                ...customAmounts,
                                [p.id]: e.target.value,
                              });
                            } else {
                              setPercentages({
                                ...percentages,
                                [p.id]: e.target.value,
                              });
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
