import React, { useState, useEffect } from "react";
import { db } from "/config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import Expenses from "./Expenses";
import CategoryManager from "./CategoryManager";
import IncomeCategoryManager from "./IncomeCategoryManager";

const Dashboard = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showIncomeCategoryManager, setShowIncomeCategoryManager] =
    useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    //income total
    const incomeQuery = query(
      collection(db, "income"),
      where("userId", "==", user.uid)
    );

    const unsubscribeIncome = onSnapshot(incomeQuery, (querySnapshot) => {
      let total = 0;
      querySnapshot.forEach((doc) => {
        const income = doc.data();
        total += Number(income.amount) || 0;
      });
      setTotalIncome(total);
    });

    return () => {
      unsubscribeIncome();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const totalExpensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid)
    );

    // display recent  3
    const recentExpensesQuery = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(3)
    );

    // total expenses
    const unsubscribeTotalExpenses = onSnapshot(
      totalExpensesQuery,
      (querySnapshot) => {
        let total = 0;
        querySnapshot.forEach((doc) => {
          const expense = doc.data();
          total += Number(expense.amount) || 0;
        });
        setTotalExpenses(total);
      }
    );

    // Listen for recent expenses
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

  return (
    <div className="dashboard-layout">
      <div className="side-menu">
        <div className="menu-header">
          <h3>Menu</h3>
        </div>
        <nav className="menu-items">
          <button
            onClick={() => {
              navigate("/dashboard");
              setShowCategoryManager(false);
              setShowIncomeCategoryManager(false);
            }}
            className={`menu-item ${
              !showCategoryManager && !showIncomeCategoryManager ? "active" : ""
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
            onClick={() => navigate("/add-savings")}
            className="menu-item savings-btn"
          >
            <span>Savings Goals</span>
          </button>
        </nav>
        <button onClick={onLogout} className="logout-btn">
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
                  <p className="total-amount">Ksh{totalIncome.toFixed(2)}</p>
                </div>
                <div className="summary-card expenses">
                  <h3>Total Expenses</h3>
                  <p className="total-amount">Ksh{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="summary-card balance">
                  <h3>Balance</h3>
                  <p className="total-amount">
                    Ksh{(totalIncome - totalExpenses).toFixed(2)}
                  </p>
                </div>
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
