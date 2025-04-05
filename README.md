# HireTune

##  Guide

### Prerequisites

- Python 3.13 or higher
- pip (Python package installer)
- - Node.js (v16+)
- npm (v8+)
- Git

### Local Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ThomasT-GitHub/HireTune.git
   cd HireTune
   ```

2. **Create and activate a virtual environment**

   ```bash
   # Create Virtual Enviornment
   python -m venv .venv

   # Activate Virtual Enviornment
   # On Windows
   .venv\Scripts\activate

   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   # Install Python dependencies
   cd HireTune
   python -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt

   # Install Node.js dependencies
   cd HireTuneSite/frontend
   npm install
   ```


4. **Set up the database**
   ## Pre-requesite, Docker!
   

   Begin by hosting a local PostgreSQL database on your device
   Give the db a user with a password

   Alter the user to use client encoding utf8
   Set the default_transaction_isolation to 'red committed'
   and set the timezone to 'UTC'

   Then grant the user all privledges on the database   

   ```bash
   cd HireTuneSite
   python manage.py migrate
   ```

5. **Create a superuser (admin)**

   ```bash
   python manage.py createsuperuser
   ```

6. **Running the Application**  
   You'll need two terminal windows:

   Terminal 1:  Run the webpack build process
   This watches for changes to React files and rebuilds automatically.

   ```bash
   cd HireTuneSite/frontend
   npm run dev
   ```

   Terminal 2: Run the Django server

   ```bash
   cd HireTuneSite
   python manage.py runserver
   ```

   **Access the Application**  
   Open your browser and visit: http://127.0.0.1:8000/

   The Django server will serve your React application. When you make changes to React components, webpack will automatically rebuild them, but you'll need to refresh your browser to see the changes.

### Development Workflow

#### Git Branching Model

1. **Main branches**

   - `main`: Production-ready code

2. **Feature development workflow**

   ```bash
   # Start from the latest main branch
   git checkout main
   git pull origin main

   # Create a feature branch
   git checkout -b feature/your-feature-name

   # Make your changes, then commit
   git add .
   git commit -m "Descriptive message about your changes"

   # Push your branch to remote
   git push origin feature/your-feature-name
   ```

3. **Creating a Pull Request**
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select `main` as the base branch and your feature branch as the compare branch
   - Add a descriptive title and description
   - Request reviews from team members

#### GitHub Issue Management

1. **Creating Issues**

   - Use clear, descriptive titles
   - Include detailed description, steps to reproduce (for bugs)
   - Add appropriate labels (bug, enhancement, etc.)
   - Assign to team members when appropriate

2. **Working with Issues**
   - Reference issue numbers in commit messages and pull requests using # (e.g., "Fix #42")
   - When creating a branch to address an issue, include the issue number in the branch name (e.g., `feature/42-user-authentication`)

### Django Project Management

1. **Creating new apps**

   ```bash
   python manage.py startapp HireTune
   ```

2. **Running migrations**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Running tests**
   ```bash
   python manage.py test
   ```

## Project Structure

- `HireTuneSite/`: Main Django project folder
  - `manage.py`: Django management script
  - `HireTuneSite/`: Project configuration folder
    - `settings.py`: Project settings
    - `urls.py`: URL routing
    - `wsgi.py` & `asgi.py`: Deployment interfaces

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Documentation](https://docs.github.com/)
