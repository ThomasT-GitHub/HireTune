# Pull base image
FROM python:3.13.2-slim-bullseye

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Set work directory
WORKDIR /code

# Install dependencies
COPY ./requirements.txt /requirements.txt

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    apt-get update && \
    rm -rf /var/lib/apt/lists/*
        

RUN /py/bin/pip install -r /requirements.txt

# Install frontend dependencies
COPY HireTuneSite/frontend/package*.json HireTuneSite/frontend/
RUN cd HireTuneSite/frontend && npm install

COPY ./HireTuneSite /HireTuneSite
WORKDIR /HireTuneSite

ENV PATH="/py/bin:$PATH"

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]