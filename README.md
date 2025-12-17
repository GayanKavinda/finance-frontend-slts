# 💰 Finance App Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<p align="center">
  <strong>A modern, secure financial dashboard built for performance and usability.</strong>
</p>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Folder Structure](#-folder-structure)

</div>

---

## 📝 About The Project

**Finance App Frontend** is the robust client-side interface for the Finance App ecosystem. It interacts seamlessly with a Laravel API to provide users with a secure, responsive, and intuitive way to manage their financial data.

Built with **Next.js (App Router)** and **Tailwind CSS**, it prioritizes speed, SEO, and developer experience. Authentication is handled securely via **Laravel Sanctum** using HttpOnly cookies.

## ✨ Features

- **🔐 Secure Authentication**: Full Login and Registration flow using HttpOnly Cookies.
- **⚡ Modern Architecture**: Built on Next.js 15 App Router for server-side rendering and lightning-fast navigation.
- **🎨 Beautiful UI**: Styled with Tailwind CSS for a fully responsive and clean aesthetic.
- **✅ Form Validation**: Robust client-side validation using `react-hook-form` and `yup`.
- **🔔 Real-time Feedback**: Interactive toast notifications via `notistack`.
- **🛡️ Protected Routes**: Route guards to ensure sensitive pages are only accessible to authenticated users.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup)
- **Notifications**: [Notistack](https://notistack.com/)

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

- Node.js 18+ installed on your machine.
- A running instance of the **Finance App Backend** (Laravel) at `http://127.0.0.1:8000`.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/finance-frontend.git
   cd finance-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**
   Ensure your backend is running. By default, this app expects the API at `http://127.0.0.1:8000`.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000) (or `http://127.0.0.1:3000` to avoid cookie domain issues).

## 📂 Folder Structure

A quick look at the top-level structure of the project:

```
finance-frontend/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Protected Dashboard routes
│   ├── signin/           # Authentication pages
│   ├── signup/
│   ├── layout.js         # Root layout
│   └── page.js           # Landing page
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context (Auth, Global State)
│   └── lib/              # Utilities (Axios config, Auth helpers)
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ by <strong>Gayan Kavinda</strong>
</div>
