# =============================================================================
# WC 2026 Oracle - Dockerfile for Render Deployment
# =============================================================================

# Base image: Python 3.11 slim (minimal size, only what's needed)
# Why slim? Full Python image is ~900MB, slim is ~150MB.
# Faster builds, smaller containers, less attack surface.
FROM python:3.11-slim

# Set working directory inside the container
# All subsequent commands run from this directory.
WORKDIR /app

# Set environment variables for Python
# PYTHONUNBUFFERED=1: Print output immediately (no buffering)
# PYTHONDONTWRITEBYTECODE=1: Don't create .pyc files (cleaner containers)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copy requirements.txt first (layer caching optimization)
# Docker builds layers - if requirements.txt hasn't changed,
# it won't re-download all pip packages on rebuild.
COPY requirements.txt .

# Install Python dependencies from requirements.txt
# --no-cache-dir: Don't cache downloaded packages (smaller image)
# --break-system-packages: Required for Python 3.11+ on some systems
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy all backend files to the container
# This includes: api/, model/, data/, and all Python scripts
COPY . .

# Expose port 8000
# This tells Docker this container listens on port 8000.
# Render uses this to route traffic to your service.
EXPOSE 8000

# Command to run when container starts
# uvicorn is the ASGI server that runs FastAPI.
# api.main:app refers to the 'app' object in api/main.py
# host=0.0.0.0: Listen on all network interfaces (required for container networking)
# port=8000: Match the EXPOSE port above
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]