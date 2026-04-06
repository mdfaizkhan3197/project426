import React, { useEffect, useState } from "react";
import API from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "Food",
        transaction_type: "Expense",
    });

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth,setSelectedMonth] = useState("")

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await API.get("expenses/");
            setExpenses(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await API.put(`expenses/${editId}/update/`, form);
                alert("Expense Updated");
                setEditId(null);
            } else {
                await API.post("expenses/", form);
                alert("Expense Added");
            }

            setForm({
                title: "",
                amount: "",
                category: "Food",
                transaction_type: "Expense",
            });

            fetchExpenses();
        } catch (error) {
            console.log(error);
            alert("Failed to save expense");
        }
    };

    const handleEdit = (item) => {
        setForm({
            title: item.title,
            amount: item.amount,
            category: item.category,
            transaction_type: item.transaction_type,
        });

        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`expenses/${id}/`);
            fetchExpenses();
        } catch (error) {
            console.log(error);
            alert("Failed to delete expense");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const totalIncome = expenses
        .filter((item) => item.transaction_type === "Income")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const totalExpense = expenses
        .filter((item) => item.transaction_type === "Expense")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const balance = totalIncome - totalExpense;

    const filteredExpenses = expenses.filter((item) => {
        const matchesSearch = item.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            filterCategory === "All" || item.category === filterCategory;

            const matchesMonth =
            selectedMonth ===""||
            new Date(item.created_at).getMonth() === Number(selectedMonth);

        return matchesSearch && matchesCategory && matchesMonth;
    });

    const categoryData = [
        {
            name: "Food",
            value: expenses
                .filter((item) => item.category === "Food")
                .reduce((acc, item) => acc + Number(item.amount), 0),
        },
        {
            name: "Travel",
            value: expenses
                .filter((item) => item.category === "Travel")
                .reduce((acc, item) => acc + Number(item.amount), 0),
        },
        {
            name: "Shopping",
            value: expenses
                .filter((item) => item.category === "Shopping")
                .reduce((acc, item) => acc + Number(item.amount), 0),
        },
        {
            name: "Bills",
            value: expenses
                .filter((item) => item.category === "Bills")
                .reduce((acc, item) => acc + Number(item.amount), 0),
        },
    ];

    const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Expense Report", 14, 20);

        const tableColumn = ["Title", "Amount", "Category", "Type"];
        const tableRows = [];

        expenses.forEach((item) => {
            const expenseData = [
                item.title,
                item.amount,
                item.category,
                item.transaction_type,
            ];
            tableRows.push(expenseData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save("expenses.pdf");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8" style={{ padding: "30px" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-blue-600">Dashboard</h1>

                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-500 text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold">Total Income</h3>
                    <p className="text-3xl font-bold mt-2">₹ {totalIncome}</p>
                </div>

                <div className="bg-red-500 text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold">Total Expense</h3>
                    <p className="text-3xl font-bold mt-2">₹ {totalExpense}</p>
                </div>

                <div className="bg-blue-500 text-white rounded-xl shadow-lg p-6" >
                    <h3 className="text-lg font-semibold">Balance</h3>
                    <p className="text-lg font-semibold">₹ {balance}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div style={{ margin: "30px 0" }}>
                    <h2 className="text-lg font-bold">Expense Category Chart</h2>

                    <PieChart width={400} height={300}>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label
                        >
                            {categoryData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                <div style={{ margin: "30px 0" }}>
                    <h2>Expense Bar Chart</h2>

                    <BarChart width={600} height={300} data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                </div>
            </div>

            <form className="bg-white shadow-lg rounded-xl p-6 mb-8" onSubmit={handleSubmit}>
                <input
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="title"
                    placeholder="Enter title"
                    value={form.title}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                </select>

                <br /><br />

                <select
                    name="transaction_type"
                    value={form.transaction_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                </select>

                <br /><br />

                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    {editId ? "Update" : "Add "}
                </button>
            </form>

            <div className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ marginRight: "10px", padding: "8px" }}
                />

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                >
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                </select>
            </div>



            <hr />

            <h2>All Expenses</h2>

            <select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
  className="border p-2 rounded-lg"
>
  <option value="">All Months</option>
  <option value="0">January</option>
  <option value="1">February</option>
  <option value="2">March</option>
  <option value="3">April</option>
  <option value="4">May</option>
  <option value="5">June</option>
  <option value="6">July</option>
  <option value="7">August</option>
  <option value="8">September</option>
  <option value="9">October</option>
  <option value="10">November</option>
  <option value="11">December</option>
</select>


            {loading ? (
                <div className="text-center text-lg font-semibold text-gray-500">
                    Loading expenses...
                </div>
            ) : filteredExpenses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                    No expenses found
                </div>
            ) : (
                filteredExpenses.map((item) => (
                    <div key={item.id} className="bg-white shadow-md rounded-xl p-5 mb-4">
                        <h3>{item.title}</h3>
                        <p>Amount: ₹ {item.amount}</p>
                        <p>Category: {item.category}</p>
                        <p>Type: {item.transaction_type}</p>
                        <p>Date:{new Date(item.created_at).toLocaleDateString()} {" "} {new Date(item.created_at).toLocaleTimeString()}</p>

                        <button
                            onClick={() => handleEdit(item)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-3 hover:bg-yellow-600"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                            Delete
                        </button>

                        <br></br>
                        <br></br>
                        <button
                            onClick={handleExportPDF}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Export PDF
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Dashboard;