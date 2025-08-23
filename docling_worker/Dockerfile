FROM python:3.12-slim-bookworm

# Install system dependencies for Tesseract OCR
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    libleptonica-dev \
    pkg-config \
    build-essential \
    # git \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set Tesseract data path
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata/
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies in one step (Docling + project deps)
# RUN pip install --no-cache-dir -r requirements.txt \
#     --extra-index-url https://download.pytorch.org/whl/cpu

# Use pip cache mount to avoid redownloading every build
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the code
COPY . .

# Default command
CMD ["python","-u", "worker.py"]
