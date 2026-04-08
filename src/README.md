# CorePayLinks - Instant Crypto Payment Gateway

CorePayLinks is a modern, fast, and intuitive payment gateway that allows users to generate instant, one-tap payment links for AVAX and BTC on the Avalanche network. Customers can easily pay using their Core Wallet, and merchants receive the equivalent value in USDC.

![CorePayLinks Screenshot](https://raw.githubusercontent.com/Dinesh-Bingi/corepaylinks-app/main/screenshot.png)

## Key Features

- **Instant Payment Links**: Generate unique payment links and corresponding QR codes in seconds.
- **Multi-Currency Support**: Accept payments in both native AVAX and Bitcoin (BTC.b on Avalanche).
- **Seamless Mobile Experience**: Uses Core Wallet deeplinking (`ethereum:` URI scheme) for a one-tap payment experience on mobile, eliminating friction.
- **Real-Time Price Estimation**: Integrated with the CoinGecko API to provide live estimates of the USDC value for any payment amount.
- **AI-Powered Insights**: Uses Google's Gemini model via Genkit to provide fun, interesting facts about the selected cryptocurrency with every payment link.
- **Live Blockchain Monitoring**: Actively listens to the Avalanche C-Chain to detect and confirm payments in real-time, updating the UI automatically.
- **Futuristic UI/UX**: Features a sleek, responsive interface with a dynamic, interactive background that follows the user's cursor.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Blockchain Integration**: [Ethers.js](https://ethers.io/) for interacting with the Avalanche C-Chain.
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dinesh-Bingi/corepaylinks-app.git
    cd corepaylinks-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---
