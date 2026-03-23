# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt --retries 10

# Copy the rest of the simulation code
COPY . .

# Expose the port the simulation service runs on
# FastAPI typically runs on 8000
EXPOSE 8000

# Run main.py when the container launches
CMD ["python", "main.py"]
