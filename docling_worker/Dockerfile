FROM python:3.12-slim-bookworm

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr tesseract-ocr-eng libtesseract-dev libleptonica-dev \
    pkg-config build-essential libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies normally (no BuildKit mount)
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy code
COPY . .

# Default command
CMD ["python3", "-u", "worker.py"]
