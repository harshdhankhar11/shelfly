# Shelfly - Smart Inventory & Order Management

Shelfly is a Next.js web application designed to help businesses manage product inventories, calculate flexible unit conversions (e.g., Grams to Kilograms, Liters to Milliliters), and track seller orders and admin logs with high-decimal precision. 

---

## 🚀 Key Features

* **Role-Based Dashboards**: Customized interfaces for **Admins**, **Sellers**, and **Buyers**.
* **Flexible Unit Conversions**: Place orders in any unit (like Kilograms) while the system automatically handles inventory updates in the base unit (like Grams).
* **High-Precision Calculations**: Uses PostgreSQL's decimal numbers to prevent rounding errors on financial and quantity data.
* **Audit Trails & Logs**: Automatically tracks stock adjustments and system activity in real-time.
* **Admin Verification**: Admins can check if the unit conversion rates of incoming orders are correct.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 16 (App Router), React, Tailwind CSS (for modern UI styling), Lucide icons.
* **Backend**: Next.js Route Handlers (API endpoints).
* **Database**: Neon Serverless PostgreSQL.
* **ORM (Object-Relational Mapping)**: Prisma with pg adapter support.
* **Redis**: For storing OTPs 
* **Authentication**: NextAuth.js (Session security).
* **State & Forms**: React Hook Form with Zod validation.

---

## 📐 System Design & Database Schema

The database contains 7 main tables to keep everything clean and separated:

1. **User**: Holds login credentials, email, and user role (`ADMIN`, `SELLER`, `BUYER`).
2. **Product**: Stores product info, the base unit, base price in INR, and a JSON object containing the scale factors for alternative units.
3. **Inventory**: Logs stock changes (increases/decreases) with reasons and references to orders.
4. **Order**: Tracks order statuses (`PENDING`, `CONFIRMED`, etc.), payment status, totals in INR, and notes.
5. **OrderItem**: Contains individual products inside an order, storing the ordered unit, quantity, base quantity, unit price, and the conversion factor used.
6. **ActivityLog**: Audits who did what in the system (e.g., product creation or status changes).
7. **Notification**: Stores alerts sent to users regarding status changes.

---

## ⚖️ Unit Storage & Conversion Strategy

To avoid inventory mismatches, Shelfly stores all stock internally in **Base Units** and calculates prices accordingly.

### How it works:
1. **Base Configuration**: Every product has a **Base Unit** (e.g., `GRAM`) and a **Base Price** per unit (e.g., `₹0.50` per gram).
2. **Conversion Factors**: Products store conversion ratios relative to the base unit in a JSON field. For example:
   * **GRAM** = `1`
   * **KILOGRAM** = `1000` (since 1 kg is 1000 grams)
   * **LITER** = `1` (base unit)
   * **MILLILITER** = `0.001` (since 1 mL is 0.001 Liters)
3. **Checkout Calculations**:
   * **Base Quantity** = `Ordered Quantity` × `Conversion Factor`
   * **Unit Price** = `Base Price` × `Conversion Factor`
   * **Total Price** = `Ordered Quantity` × `Unit Price`
4. **Code Location**: 
   * Frontend: Dynamic pricing is rendered in real-time inside `app/(dashboard)/seller/orders/new/page.tsx`.
   * Backend API: Stored ratios are processed inside `app/api/seller/orders/route.ts` and `app/api/buyer/orders/route.ts`.
   * Conversion calculations are abstracted inside the `utils/unitConversion.ts` library.

---

## 🔑 Test Credentials

Use the following logins to test the role capabilities of each panel:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin@123` |
| **Seller** | `seller@gmail.com` | `seller@123` |
| **Buyer** | `buyer@gmail.com` | `buyer@123` |

---

## 💻 How to Use Each Panel

### 1. Admin Panel (`/admin`)
* **Analytics**: Track aggregate sales revenue, pending order ratios, and low-stock alerts.
* **Product CRUD**: Add, edit, or disable catalog products. Configure base units and map alternative unit conversion factors.
* **Order Audit**: View incoming orders. The system checks the conversion ratio of each ordered item and highlights a green validation badge if the ratio matches the catalog definition.
* **System Logs**: Audit history of all updates made to products, orders, and users.

### 2. Seller Panel (`/seller`)
* **Marketplace Browse**: Browse active catalogs, use search parameters, or filter by category.
* **Real-time Calculator**: Input a quantity in a conversion unit (e.g., Liter) to preview the calculated base quantity and total price in INR immediately.
* **Place Orders**: Place order documents with specific buyer notes.
* **My Sales**: Manage incoming orders placed for products you created and update their fulfillment.

### 3. Buyer Panel (`/buyer`)
* **Read-only Catalog**: Browse available items, pricing structures, and specifications.
* **Order History**: View your individual purchase statement, total expenditure, and delivery statuses.

---

## ⚙️ Local Setup Instructions

Follow these steps to run the project on your machine:

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd shelfly
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root folder and add the following keys:
   ```env
   DATABASE_URL="your-neon-postgresql-connection-string"
   NEXTAUTH_SECRET="any-random-long-string-for-auth"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: Redis URL for storing otps
   REDIS_URL="your-redis-url"
   
   # Optional: Email Service Credentials
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-email-app-password"
   ```

4. **Synchronize the Database**:
   Run Prisma migrations to create the tables in your Neon PostgreSQL database:
   ```bash
   pnpm prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Deployment to Vercel

To deploy the application to Vercel:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the project.
3. In Vercel's **Environment Variables** section, copy the exact variables configured in your local `.env` file.
4. Set the `NEXTAUTH_URL` variable to your production domain (e.g., `https://shelfly.vercel.app`).
5. Click **Deploy**. Vercel will build the project and output a live production URL.
