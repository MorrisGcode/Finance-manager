import React, { useState, useEffect, useRef } from 'react';
import { db } from '/config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ user, onLogout }) => {
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showIncomeCategoryManager, setShowIncomeCategoryManager] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const chartRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        try {
            const incomeQuery = query(
                collection(db, "income"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribeIncome = onSnapshot(incomeQuery, (querySnapshot) => {
                let total = 0;
                querySnapshot.forEach((doc) => {
                    const income = doc.data();
                    let amount = 0;
                    if (typeof income.amount === 'string') {
                        amount = parseFloat(income.amount) || 0;
                    } else if (typeof income.amount === 'number') {
                        amount = income.amount;
                    }
                    total += amount;
                });
                console.log('Total Income Updated:', total);
                setTotalIncome(total);
            }, (error) => {
                console.error("Error fetching income:", error);
                setTotalIncome(0);
            });

            return () => unsubscribeIncome();
        } catch (error) {
            console.error("Error setting up income listener:", error);
            setTotalIncome(0);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const totalExpensesQuery = query(
            collection(db, "expenses"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const recentExpensesQuery = query(
            collection(db, "expenses"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        // Total expenses listener
        const unsubscribeTotalExpenses = onSnapshot(
            totalExpensesQuery,
            (querySnapshot) => {
                let total = 0;
                querySnapshot.forEach((doc) => {
                    const expense = doc.data();
                    total += typeof expense.amount === 'string'
                        ? parseFloat(expense.amount)
                        : expense.amount || 0;
                });
                setTotalExpenses(total);
            }
        );

        // recent expenses Listener
        const unsubscribeRecentExpenses = onSnapshot(
            recentExpensesQuery,
            (querySnapshot) => {
                const expensesData = [];
                querySnapshot.forEach((doc) => {
                    const expense = {
                        id: doc.id,
                        ...doc.data(),
                    };
                    expensesData.push({
                        ...expense,
                        amount: Number(expense.amount) || 0,
                    });
                });
                setExpenses(expensesData);
            }
        );

        // Cleanup both listeners
        return () => {
            unsubscribeTotalExpenses();
            unsubscribeRecentExpenses();
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const categoriesQuery = query(
            collection(db, "expenseCategories"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
            const categoriesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCategories(categoriesData);
        });

        return () => unsubscribe();
    }, [user]);

    // Data for the chart
    const chartData = [
        {
            name: 'Income',
            amount: totalIncome,
        },
        {
            name: 'Expenses',
            amount: totalExpenses,
        },
    ];

    return (
        <div className="dashboard-layout">
            <div className="side-menu">
                <div className="menu-header">
                    <h3>Finance Manager</h3>
                </div>
                <nav className="menu-items">
                    <button
                        onClick={() => {
                            navigate("/dashboard");
                            setShowCategoryManager(false);
                            setShowIncomeCategoryManager(false);
                        }}
                        className={`menu-item ${!showCategoryManager && !showIncomeCategoryManager ? "active" : ""
                            }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setShowCategoryManager(true);
                            setShowIncomeCategoryManager(false);
                        }}
                        className={`menu-item ${showCategoryManager ? "active" : ""}`}
                    >
                        Manage Expense Categories
                    </button>
                    <button
                        onClick={() => {
                            setShowCategoryManager(false);
                            setShowIncomeCategoryManager(true);
                        }}
                        className={`menu-item ${showIncomeCategoryManager ? "active" : ""}`}
                    >
                        Manage Income Categories
                    </button>
                    <button
                        onClick={() => navigate("/all-expenses")}
                        className="menu-item"
                    >
                        All Expenses
                    </button>
                    <button
                        onClick={() => navigate("/all-incomes")}
                        className="menu-item"
                    >
                        All Incomes
                    </button>
                    <button
                        onClick={() => navigate("/savings")}
                        className="menu-item"
                    >
                        Savings
                    </button>
                </nav>
                <button
                    onClick={onLogout}
                    className="logout-btn"
                    disabled={!user}
                >
                    Logout
                </button>
            </div>

            <div className="dashboard-container">
                {showCategoryManager ? (
                    <div className="categories-dashboard">
                        <header className="categories-header">
                            <h2>Expense Categories</h2>
                            <p>Manage your expense categories here</p>
                        </header>

                        <CategoryManager user={user} />
                    </div>
                ) : showIncomeCategoryManager ? (
                    <div className="categories-dashboard">
                        <header className="categories-header">
                            <h2>Income Categories</h2>
                            <p>Manage your income categories here</p>
                        </header>
                        <IncomeCategoryManager user={user} />
                    </div>
                ) : (
                    <>
                        <header className="dashboard-header">
                            <h1>Welcome, {user?.displayName || user.email}!</h1>
                        </header>

                        <div className="dashboard-summary">
                            <div className="summary-cards">
                                <div className="summary-card income">
                                    <h3>Total Income</h3>
                                    <p className="total-amount">
                                        Ksh {totalIncome.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                                <div className="summary-card expenses">
                                    <h3>Total Expenses</h3>
                                    <p className="total-amount">
                                        Ksh {totalExpenses.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                                <div className="summary-card balance">
                                    <h3>Balance</h3>
                                    <p className="total-amount">
                                        Ksh {(totalIncome - totalExpenses).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="chart-container">
                                <h2>Income vs Expenses</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        ref={chartRef}
                                        data={chartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="amount" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="dashboard-main">
                            <h2>Recent Expenses</h2>
                            <div className="expenses-list">
                                {expenses.length === 0 ? (
                                    <p className="no-expenses">No expenses recorded yet.</p>
                                ) : (
                                    expenses.map((expense) => (
                                        <div key={expense.id} className="expense-item">
                                            <div className="expense-info">
                                                <h3>{expense.description}</h3>
                                                <p className="expense-category">{expense.category}</p>
                                                <p className="expense-date">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="expense-amount">
                                                Ksh{expense.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

