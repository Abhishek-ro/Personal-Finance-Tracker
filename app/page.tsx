"use client";

import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type Transaction = {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [budgetAmount, setBudgetAmount] = useState<number | "">("");
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgets, setBudgets] = useState<{ [key: string]: number }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [budgetMonth, setBudgetMonth] = useState(format(new Date(), "MMMM'YY"));

  const { toast } = useToast();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleAddBudget = async () => {
    if (
      !budgetAmount ||
      isNaN(Number(budgetAmount)) ||
      Number(budgetAmount) <= 0
    ) {
      toast({
        title: "Invalid Budget Amount",
        description: "Please set a valid positive budget amount.",
      });
      return;
    }
    setBudgets((prev) => ({
      ...prev,
      [budgetCategory]: +budgetAmount,
    }));

    const response = await fetch("/api/budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        month: budgetMonth,
        category: budgetCategory,
        budget: budgetAmount,
      }),
    });

    if (response.ok) {
      toast({
        title: "Budget Added",
        description: "Budget added successfully.",
      });
      setBudgetAmount("");
      setBudgetCategory("Food");
      await fetchBudgets();
    } else {
      console.error("Failed to add budget");
      toast({
        title: "Error adding budget",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateTransaction = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number.",
      });
      return false;
    }
    if (!date || !isValid(parseISO(date))) {
      toast({
        title: "Invalid Date",
        description: "Please select a valid date.",
      });
      return false;
    }
    if (!description.trim()) {
      toast({
        title: "Invalid Description",
        description: "Description cannot be empty.",
      });
      return false;
    }
    return true;
  };

  const validateEditTransaction = () => {
    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be a positive number.",
      });
      return false;
    }
    if (!editDate || !isValid(parseISO(editDate))) {
      toast({
        title: "Invalid Date",
        description: "Please select a valid date.",
      });
      return false;
    }
    if (!editDescription.trim()) {
      toast({
        title: "Invalid Description",
        description: "Description cannot be empty.",
      });
      return false;
    }
    return true;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        toast({
          title: "Error fetching transactions",
          description: `HTTP error! status: ${res.status}`,
          variant: "destructive",
        });
        return []; 
      }
      const data = await res.json();
      console.log("dataaaaaaaa", data);
      return data ?? [];
    } catch (error) {
      console.error("Error during fetch:", error);
      toast({
        title: "Error fetching transactions",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budget");
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        toast({
          title: "Error fetching budgets",
          description: `HTTP error! status: ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      const data = await res.json();
      const budgetMap: { [key: string]: number } = {};
      data.forEach((budgetItem: { category: string; budget: number }) => {
        budgetMap[budgetItem.category] = budgetItem.budget;
      });
      setBudgets(budgetMap);
    } catch (error) {
      console.error("Error during fetch:", error);
      toast({
        title: "Error fetching transactions",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return [];
    }
  };

  const addTransaction = async () => {
    if (!validateTransaction()) {
      return;
    }
    const response = await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ amount: +amount, date, description, category }),
    });

    if (response.ok) {
      toast({
        title: "Transaction Added",
        description: "Transaction added successfully.",
      });
      setAmount("");
      setDate("");
      setDescription("");
      const updatedTransactions = await fetchTransactions();
      setTransactions(updatedTransactions);
    } else {
      console.error("Failed to add transaction");
      toast({
        title: "Error adding transaction",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast({
        title: "Transaction Deleted",
        description: "Transaction deleted successfully.",
      });
      const updatedTransactions = await fetchTransactions();
      setTransactions(updatedTransactions);
    } else {
      console.error(`Failed to delete transaction with ID: ${id}`);
      toast({
        title: "Error deleting transaction",
        description: `Failed to delete transaction with ID: ${id}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setIsEditing(true);
    setEditingTransactionId(transaction._id);
    setEditAmount(String(transaction.amount));
    setEditDate(transaction.date);
    setEditDescription(transaction.description);
    setEditCategory(transaction.category);
  };

  const saveEdit = async () => {
    if (!validateEditTransaction()) {
      return;
    }
    if (!editingTransactionId) return;
    const response = await fetch(`/api/transactions/${editingTransactionId}`, {
      method: "PUT",
      body: JSON.stringify({
        amount: +editAmount,
        date: editDate,
        description: editDescription,
        category: editCategory,
      }),
    });

    if (response.ok) {
      toast({
        title: "Transaction Updated",
        description: "Transaction updated successfully.",
      });
      setIsEditing(false);
      setEditingTransactionId(null);
      const updatedTransactions = await fetchTransactions();
      setTransactions(updatedTransactions);
    } else {
      console.error("Failed to update transaction");
      toast({
        title: "Error updating transaction",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTransactionId(null);
  };

  const budgetComparisonData = Object.entries(budgets).map(
    ([category, budget]) => {
      const spent = transactions
        .filter((tx) => tx.category === category)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        category,
        budget,
        spent,
        difference: budget - spent,
      };
    }
  );

  const getBudgetStatus = (spent: number, budget: number) => {
    const difference = budget - spent;
    if (difference > budget * 0.2) {
      return {
        status: "Under Budget",
        color: "text-green-600 ml-5.5",
        message: `Under by ₹${difference.toFixed(2)}`,
      };
    }
    if (difference >= 0) {
      return {
        status: "On Track",
        color: "text-yellow-600 ml-5.5",
        message: `₹${difference.toFixed(2)} remaining`,
      };
    }
    return {
      status: "Over Budget",
      color: "text-red-600 ml-5.5",
      message: `Over by ₹${Math.abs(difference).toFixed(2)}`,
    };
  };

  useEffect(() => {
    const calculateTotal = (transactionsArray: Transaction[]) => {
      return transactionsArray.reduce((sum, tx) => sum + tx.amount, 0);
    };

    fetchTransactions()
      .then((data) => {
        console.log("Transactions fetched:", data);
        setTransactions(data);
        const total = calculateTotal(data);
        console.log("Total expenses:", total);
        setTotalExpenses(total);
      })
      .catch((error) => {
        console.error("Error in useEffect:", error);
      });

    fetchBudgets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p>Loading transactions...</p>;
  }

  if (transactions.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-2 py-1 text-sm  sm:col-span-2 md:col-span-1 text-white focus:bg-gray-900"
          >
            <option value="Food">Food</option>
            <option value="Rides">Rides</option>
            <option value="Shop">Shop</option>
            <option value="Bills">Bills</option>
            <option value="Fun">Fun</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <Button onClick={addTransaction}>Add Transaction</Button>
        <div className="mt-6">
          <p className="text-gray-500">
            No transactions added yet. Add your first transaction!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            type="number"
            placeholder="Set Budget"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(Number(e.target.value))}
          />
          <select
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
            className="border rounded px-2 py-1 text-sm col-span-3 text-white focus:bg-gray-900"
          >
            <option value="Food">Food</option>
            <option value="Rides">Rides</option>
            <option value="Shop">Shop</option>
            <option value="Bills">Bills</option>
            <option value="Fun">Fun</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={budgetMonth}
            onChange={(e) => setBudgetMonth(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {months.map((month) => (
              <option
                key={month}
                value={format(new Date(month + " 01, 2025"), "MMMM'YY")}
              >
                {month}{" "}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddBudget}
            className="col-span-3 md:col-span-1"
          >
            Add Budget
          </Button>
        </div>
      </main>
    );
  }

  const monthlyData = transactions.reduce((acc: Record<string, number>, tx) => {
    const month = format(parseISO(tx.date), "MMMM yyyy");
    acc[month] = (acc[month] || 0) + tx.amount;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, total]) => ({
    month,
    total,
  }));

  const categoryData = transactions.reduce(
    (acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      console.log(acc);
      return acc;
    },
    {}
  );

  const chartCategoryData = Object.entries(categoryData).map(
    ([category, total]) => ({
      name: category,
      value: total,
    })
  );

const COLORS = [
  "#FFBB28",
  "#00C49F",
  "#FF8042",
  "#0088FE",
  "#FF0000",
  "#800080",
];
const usedColors = new Set<string>();

const getUniqueColor = () => {
  if (usedColors.size === COLORS.length) {
    usedColors.clear(); 
  }

  let color: string;
  do {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    color = COLORS[randomIndex];
  } while (usedColors.has(color));

  usedColors.add(color);
  return color;
};
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-2 py-1 text-sm col-span-3 text-white focus:bg-gray-900"
        >
          <option value="Food">Food</option>
          <option value="Rides">Rides</option>
          <option value="Shop">Shop</option>
          <option value="Bills">Bills</option>
          <option value="Fun">Fun</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <Button onClick={addTransaction}>Add Transaction</Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Input
          type="number"
          placeholder="Set Budget"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(Number(e.target.value))}
        />
        <select
          value={budgetCategory}
          onChange={(e) => setBudgetCategory(e.target.value)}
          className="border rounded px-2 py-1 text-sm col-span-3 text-white focus:bg-gray-900 max-w-[95%] "
        >
          <option value="Food">Food</option>
          <option value="Rides">Rides</option>
          <option value="Shop">Shop</option>
          <option value="Bills">Bills</option>
          <option value="Fun">Fun</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={budgetMonth}
          onChange={(e) => setBudgetMonth(e.target.value)}
          className="border rounded px-2 py-1 text-sm text-white focus:bg-gray-900"
        >
          {months.map((month) => (
            <option
              key={month}
              value={format(new Date(month + " 01, 2025"), "MMMM'YY")}
            >
              {month}{" "}
            </option>
          ))}
        </select>
        <Button onClick={handleAddBudget} className="col-span-3">
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
          <p className="text-2xl font-bold">₹{totalExpenses}</p>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartCategoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {chartCategoryData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={getUniqueColor()} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Monthly Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Budget vs Actual</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetComparisonData} layout="vertical">
              <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
              <YAxis type="category" dataKey="category" />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="budget" fill="#4f46e5" name="Budget" />
              <Bar dataKey="spent" fill="#f97316" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {budgetComparisonData.map(({ category, spent, budget }) => {
              const { status, color, message } = getBudgetStatus(spent, budget);
              return (
                <div
                  key={category}
                  className="flex justify-between border p-2 rounded shadow-sm bg-black-50 text-sm md:text-base lg:text-lg"
                >
                  <span
                    className="font-medium text-white text-sm md:text-base lg:text-lg"
                    style={{
                      fontSize: `calc(0.7rem + (1.3vw - 0.7rem) * max(0px, min(100vw - 300px, 200px)) / 200px)`,
                    }}
                  >
                    {category}
                  </span>
                  <span className={color}>
                    {status} ({message})
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        {transactions.map((tx) => (
          <Card key={tx._id} className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium">{tx.description}</p>
              <p className="text-sm text-muted-foreground">
                ₹{tx.amount} on {format(parseISO(tx.date), "dd MMM'YY")}
              </p>
            </div>
            <div>
              <Button size="sm" onClick={() => handleEdit(tx)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTransaction(tx._id)}
                className="ml-2"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {isEditing && editingTransactionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Transaction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Amount"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              <Input
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="Food">Food</option>
                <option value="Rides">Rides</option>
                <option value="Shop">Shop</option>
                <option value="Bills">Bills</option>
                <option value="Fun">Fun</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit}>
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
