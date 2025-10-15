🗨️ Lokesh Chat - A Multimodal AI Chat Application
Lokesh Chat is a modern, responsive, and intelligent chat application built with Next.js and Google's Gemini. It supports multimodal interactions, allowing users to have fluid conversations with both text and images.

✨ Key Features
Multimodal Conversations: Seamlessly switch between text and image inputs to have a rich, contextual conversation with the AI.

AI-Powered Responses: Leverages the power of Google's Gemini model through the Genkit framework to provide intelligent and relevant answers.

Sleek & Modern UI: A beautiful and responsive user interface built with shadcn/ui and Tailwind CSS, ensuring a great user experience on any device.

Streaming Responses: Messages appear word-by-word, creating a dynamic and engaging chat experience.

Persistent Chat History: Conversations are saved, allowing you to pick up where you left off (feature can be expanded with a database).

Developer-Friendly: Includes a Genkit developer UI for easy inspection and debugging of AI flows.

🛠️ Technology Stack
This project is built with a modern, type-safe, and scalable tech stack.

Area	Technology / Library
Framework	Next.js, React.js
Language	TypeScript
AI	Google Gemini, Genkit Framework
Styling	Tailwind CSS
UI	shadcn/ui, Radix UI, Lucide React

Export to Sheets
🚀 Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
Node.js (v18 or later)

npm, yarn, or pnpm

Installation & Setup
Clone the Repository:

Bash

git clone https://github.com/your-username/lokesh-chat.git
cd lokesh-chat
Install Dependencies:

Bash

npm install
Configure Environment Variables:

Create a .env.local file in the root directory.

Add your Google Gemini API key to this file. You can obtain one from Google AI Studio.

Code snippet

GOOGLE_GENAI_API_KEY=your_gemini_api_key
Run the Genkit Developer UI:

In a separate terminal, start the Genkit development server to monitor your AI flows.

Bash

npx genkit start
This will open the Genkit UI, typically at http://localhost:4000.

Run the Next.js Development Server:

In your main terminal, run the Next.js app.

Bash

npm run dev
Open http://localhost:3000 with your browser to see the chat application.

📂 Project Structure
The project is organized logically to separate the AI logic from the frontend components.

/
├── src/
│   ├── ai/                 # All Genkit AI logic and flows
│   │   ├── flows/
│   │   └── genkit.ts       # Main Genkit configuration
│   ├── app/                # Next.js App Router pages and layout
│   │   ├── api/            # API routes for frontend-backend communication
│   │   └── page.tsx        # Main application page
│   ├── components/         # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── chat-interface.tsx # The core chat component
│   └── lib/                # Utility functions
└── ...                     # Configuration files
