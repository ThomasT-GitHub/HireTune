# Pull base image
FROM python:3.13.2-slim-bullseye

ENV OPENAI_API_KEY="PUT KEY"

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONFAULTHANDLER=1

# Install Node.js, npm, and a FULL LaTeX distribution
RUN apt-get update && apt-get install -y nodejs npm \
    texlive-full \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /code

# Install dependencies
COPY ./requirements.txt /requirements.txt

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    /py/bin/pip install -r /requirements.txt

COPY ./HireTuneSite /HireTuneSite
WORKDIR /HireTuneSite

ENV PATH="/py/bin:$PATH"

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


