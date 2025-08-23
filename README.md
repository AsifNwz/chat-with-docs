# 📚 Chat with Your PDFs and URLs

This project allows users to upload PDF documents or provide a URL, store their content in a vector database (**Qdrant**), and then chat with the documents using an AI-powered interface.

## 🚀 Features

- Upload PDFs via the web UI
- Provide a link (URL) in the input box — select the checkbox if you want to parse all inner/nested links
- Extract text using a worker service
- Store embeddings in the **Qdrant** vector database
- Ask questions and chat with your PDFs or any URL
- Powered by **LangChain** + **OpenAI**

## 🛠️ Tech Stack

- **Next.js** → Frontend UI
- **Node.js (Express)** → API backend
- **RabbitMQ** → Task queue for workers
- **Docling Worker (Python)** → Extracts and processes PDF and URL data
- **Qdrant** → Vector database for embeddings storage
- **OpenAI** → Embedding + chat models

## 📂 Project Structure

```
├── nextjs/               # Frontend (Next.js + Tailwind)
├── node_app/             # Backend API (Express + LangChain)
├── docling_worker/       # Python worker for PDF/URL parsing
├── uploads_data/         # Uploaded PDFs (bind mount)
└── docker-compose.yml
```

## ⚙️ Setup

### 1. Clone the repo

### 2. Create a `.env` file in the project root (where `docker-compose.yml` is located):

- `.env`

```env
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### 3. Start with Docker Compose

```bash
docker compose up -d --build

# This will install packages and spin up the services.
# It may take some time depending on your network speed.
```

### 4. Access services

- **Frontend (Next.js)** → [http://localhost:3000](http://localhost:3000)
- **Backend API (Node.js)** → [http://localhost:8000](http://localhost:8000)
- **RabbitMQ Dashboard** → [http://localhost:15672](http://localhost:15672) (Username: guest, Password: guest)
- **Qdrant Dashboard** → [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

## 📖 How it Works

1. The user uploads a PDF or provides a URL via the frontend.
2. **node_app** saves the file in the **uploads_data** folder and enqueues the file/URL in RabbitMQ.
3. The **docling_worker** reads the PDF or URL, extracts the text, generates a markdown file, and acknowledges processing.
4. **node_app** chunks the markdown and creates embeddings with OpenAI.
5. Embeddings are stored in **Qdrant**
6. The user asks questions in the chat UI → backend retrieves relevant chunks from Qdrant → sends them to OpenAI for an answer.

## 🧹 Development Notes

- Uploaded files are stored in `uploads_data/` (bind mount so they persist on the host machine).

- To rebuild everything:

```bash
docker compose down
docker compose build --no-cache #Fresh image
docker compose up -d
```

## 🔮 Future Improvements

- ***

💡 Upload PDFs or URLs, and start chatting with them. You can also deploy this stack on any server.
