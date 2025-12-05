# 🚀 Startup Value Navigator

<div align="center">

![Version](https://img.shields.io/badge/Version-3.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![License](https://img.shields.io/badge/License-BSL_1.1-orange?style=for-the-badge)

**A professional-grade startup valuation platform using VC-backed methodologies**

### [🌐 Try the Live App](https://abdash1994.github.io/startup-valuation/)

[📖 Product Walkthrough](https://abdash1994.github.io/startup-valuation/walkthrough-full.html) • [📐 Methodology](./docs/VALUATION_METHODOLOGY.md) • [🐛 Report Bug](https://github.com/abdash1994/startup-valuation/issues)

</div>

---

## 🎯 What is Startup Value Navigator?

Startup Value Navigator is a **free, browser-based valuation tool** that helps founders, investors, and advisors estimate startup enterprise value using industry-standard methodologies. Get instant valuations across three scenarios (Bear, Base, Bull) as you adjust your metrics—no spreadsheets required.

### Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Valuation** | Instant calculations as you adjust inputs |
| 🎯 **Stage-Aware Methods** | Berkus, Scorecard, Revenue Multiples by stage |
| 📈 **Three Scenarios** | Bear, Base, and Bull case modeling |
| 🤖 **AI Insights** | Contextual analysis and recommendations |
| 🔐 **User Accounts** | Save, edit, and manage your valuations |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |

### New in v3.0

| Feature | Description |
|---------|-------------|
| 📐 **Methodology Panel** | View calculation details, formulas, and assumptions |
| 📏 **Metric Benchmarks** | Stage-specific hints under each input slider |
| 📚 **Valuation Library** | Save unlimited scenarios to local storage |
| 🔗 **Shareable Links** | Read-only URLs for investors and advisors |
| 📊 **Portfolio View** | Compare multiple valuations with aggregates |
| 📄 **PDF Reports** | Download professional investor-ready summaries |
| 🎓 **Onboarding Tour** | 3-step interactive introduction for new users |
| 🔄 **Password Reset** | Secure email-based password recovery |

---

## 🚀 Getting Started

### Use the Live App (Recommended)

**No installation required!** Simply visit:

👉 **[abdash1994.github.io/startup-valuation](https://abdash1994.github.io/startup-valuation/)**

1. Click **"Try Valuator"** to start immediately (no account needed)
2. Or **Sign Up** to save your valuations to your personal dashboard

---

## 📐 Valuation Methodology

We use **industry-standard methodologies** validated against real VC deals:

| Stage | Method | Typical Valuation Range |
|-------|--------|-------------------------|
| **Pre-seed / Concept** | Berkus Method | $250K – $2M |
| **Seed** | Scorecard Method | $2M – $10M |
| **Series A** | Revenue Multiple (10-25x ARR) | $15M – $60M |
| **Series B** | Revenue Multiple (8-18x ARR) | $50M – $200M |
| **Series C+** | Revenue Multiple (6-15x ARR) | $150M+ |

> 📚 For detailed research, citations, and validation, see [VALUATION_METHODOLOGY.md](./docs/VALUATION_METHODOLOGY.md)

---

## 📊 Input Metrics

| Metric | Range | What It Measures |
|--------|-------|------------------|
| **ARR** | $0 – $200M | Annual Recurring Revenue |
| **Monthly Growth** | 0% – 50% | Month-over-month revenue growth |
| **TAM** | $100M – $500B | Total Addressable Market |
| **Gross Margin** | 20% – 95% | Revenue minus COGS |
| **Net Retention** | 50% – 180% | Revenue from existing customers |
| **Burn Multiple** | 0x – 5x | Net burn ÷ Net new ARR |
| **Team Strength** | 1 – 5 | Leadership quality & execution |
| **Product Moat** | 1 – 5 | Defensibility & IP |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **PDF Generation** | jsPDF |
| **Styling** | Custom CSS with CSS Variables |
| **Routing** | React Router DOM v7 |
| **Storage** | localStorage for Library/Portfolio |
| **Hosting** | GitHub Pages |

---

## 💻 Self-Hosting (For Developers)

If you want to run your own instance:

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account (free tier works)

### Setup

```bash
# Clone the repository
git clone https://github.com/abdash1994/startup-valuation.git
cd startup-valuation

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Add your Supabase credentials to .env:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor:
- File: `supabase/schema.sql`

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 📄 License

This project is licensed under the **Business Source License 1.1 (BSL)**.

| Permission | Status |
|------------|--------|
| View source code | ✅ Allowed |
| Personal/educational use | ✅ Allowed |
| Learn from implementation | ✅ Allowed |
| Commercial use | ❌ Requires license |
| Redistribute/resell | ❌ Not allowed |

See [LICENSE](./LICENSE) for full terms.

---

## 🤝 Contributing

Contributions are welcome for:
- Bug fixes
- Documentation improvements
- Accessibility enhancements

For feature additions, please [open an issue](https://github.com/abdash1994/startup-valuation/issues) first to discuss.

---

## 📬 Contact

**Aditya Dash**  
- GitHub: [@abdash1994](https://github.com/abdash1994)

---

<div align="center">

**Built with ❤️ for founders and investors**

⭐ **Star this repo** if you find it useful!

[Try the App →](https://abdash1994.github.io/startup-valuation/)

</div>
