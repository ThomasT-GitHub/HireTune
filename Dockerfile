# Pull base image
FROM python:3.13.2-slim-bullseye

ENV OPENAI_API_KEY=""

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Node.js, npm, and a minimal LaTeX distribution.
RUN apt-get update && apt-get install -y nodejs npm texlive-latex-base

# Set work directory
WORKDIR /code

# Install dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Install frontend dependencies
COPY HireTuneSite/frontend/package*.json HireTuneSite/frontend/
RUN cd HireTuneSite/frontend && npm install

# Copy project
COPY . .

# Add command to run the server
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]