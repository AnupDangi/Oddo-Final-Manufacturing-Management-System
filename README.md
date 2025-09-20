# 🏭 Manufacturing Management System – From Order to Output

## 📌 Overview

This project is a **modular manufacturing management application** that helps businesses manage their **end-to-end production process digitally**.
It replaces fragmented spreadsheets and manual tracking with a **centralized, user-friendly platform**, providing full visibility into orders, work orders, stock, and reports.

Built as part of the **NMIT Hackathon**, this system demonstrates real-world **ERP workflows** for manufacturing.

---

## 🚀 Problem Statement

* Fragmented systems for **orders, stock, and BOM** (Bill of Materials).
* No visibility into **production stages & progress**.
* Lack of **real-time dashboards** for KPIs and delays.
* Manual paperwork for BOMs, stock ledgers, and reports → **error-prone**.
* Limited integration between **inventory, production, and reporting**.

Our solution integrates these into a **single platform** with proper modules and reporting.

---

## 👥 Target Users

* **Manufacturing Managers** → Create/track production orders, oversee workflows.
* **Operators / Shop-floor Workers** → Execute assigned tasks (work orders).
* **Inventory Managers** → Track raw material usage and stock balance.
* **Business Owners / Admins** → Monitor KPIs, generate reports, ensure traceability.

---

## 🔄 Workflow

1. **Manager creates Manufacturing Order (MO)** → product, quantity, deadline.
2. **System fetches BOM** → calculates raw material requirements.
3. **Inventory Manager checks stock** → reserves/raises alerts if insufficient.
4. **System generates Work Orders (WO)** → Assembly, Painting, Packaging.
5. **Operators execute tasks** → start/pause/complete status updates.
6. **Stock Ledger updates automatically** → raw material out, finished goods in.
7. **Dashboard & Reports** → KPIs, costs, utilization, exportable reports.

---

## 🛠️ Tech Stack

### **Frontend**

* **React.js / Next.js** → Dynamic, responsive UI
* **TailwindCSS / Chakra UI** → Modern UI styling
* **Shadcn/UI** → Components for dashboard & forms

### **Backend**

* **Node.js + Express** → API services
* **REST API** → For communication between frontend & backend
* **JWT Authentication** → User roles & secure access

### **Database**

* **PostgreSQL / MySQL** → Relational database for manufacturing workflow

### **Other Tools**

* **Supabase** → Authentication & storage
* **Graphviz / Mermaid** → System diagrams & reporting
* **Excel/PDF Export APIs** → Report generation

---

## 🗂️ Database Design (High-Level Tables)

* **Users** → (id, name, role, email, password)
* **Products** → (id, name, type: raw/finished, stock\_qty, unit\_cost)
* **BOM (Bill of Materials)** → (product\_id, component\_id, qty\_required)
* **Manufacturing Orders (MO)** → (id, product\_id, qty, status, start\_date, deadline, created\_by)
* **Work Orders (WO)** → (id, mo\_id, step\_name, work\_center\_id, operator\_id, status, timestamps)
* **Work Centers** → (id, name, capacity, cost\_per\_hour)
* **Stock Ledger** → (id, product\_id, movement\_type \[IN/OUT], qty, timestamp, ref\_id)

---

## 📊 Features

✅ **Authentication & Role-based Access**  
✅ **Dashboard with Filters & KPIs**  
✅ **Manufacturing Orders (MO) Management**  
✅ **Work Orders (WO) Assignment & Tracking**  
✅ **Stock Ledger – Real-time Inventory Updates**  
✅ **Bill of Materials (BoM) Linking**  
✅ **Analytics Dashboard (Delays, Resource Utilization)**  
✅ **Export Reports (Excel/PDF)**  
✅ **Scalable Architecture** → add Quality Check, Maintenance later

---

## 📈 Example Use Case

* Manager **creates MO** → 10 Wooden Tables.
* System **auto-fetches BOM** → 40 legs, 10 tops, 120 screws, 10 varnish.
* Inventory Manager **confirms stock** → reserves raw materials.
* Work Orders created: **Assembly (Suresh), Painting (Amit), Packaging (Kiran)**.
* Operators **execute tasks** → stock ledger updates.
* Dashboard shows **10 Tables completed, on-time**.

---

## 🏆 Hackathon Value

* Teaches students **ERP workflows** for manufacturing.
* Demonstrates how **modules integrate** (Orders → Inventory → Reports).
* Focus on **business logic + coding**, not just UI.

---

## 📌 Future Enhancements

* Quality Check Module (QC reports).
* Maintenance Scheduling for Work Centers.
* AI-powered demand forecasting.
* IoT integration for machine monitoring.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL or MySQL database


## Project Coming Soon