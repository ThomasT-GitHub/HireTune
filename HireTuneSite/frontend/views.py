from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from openai import OpenAI
from pylatex import Document, NoEscape
from django.views import View
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from frontend.models import JobApplication, Account
from django.views.decorators.http import require_http_methods
from django.contrib.auth import logout
from django.shortcuts import redirect


def current_user(request):
    data = {
        "is_authenticated": request.user.is_authenticated,
        "username": request.user.username if request.user.is_authenticated else None,
    }
    return JsonResponse(data)


def index(request):
    return render(request, "frontend/index.html")


def tuner(request):
    return render(request, "frontend/tuner.html")


def applicationView(request):
    return render(request, "frontend/applicationView.html")


# Add this function to your views.py
def logout_view(request):
    """Log the user out and redirect to the landing page"""
    logout(request)
    return redirect("/")


@csrf_exempt
def tune_resume(request):
    try:
        data = json.loads(request.body)
        resume = data.get("resume")
        job_description = data.get("jobDescription")

        if not resume or not job_description:
            return JsonResponse(
                {"error": "Resume and job description are required"}, status=400
            )

        # Construct a single prompt to pass to the API.
        prompt = (
            "You are a professional resume editor. Your task is to tune the given resume in LaTeX format "
            "to better match the job description. Return only JSON with field: 'tuned_resume' .\n\n"
            f"Resume in LaTeX format:\n{resume}\n\n"
            f"Job Description:\n{job_description}\n"
        )

        # Initialize OpenAI client.
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

        # Create a response using the new API syntax.
        response = client.responses.create(
            model="gpt-4o",  # or your preferred model that supports responses.create
            input=prompt,
        )

        # Extract and check the output.
        output = response.output_text.strip()

        if not output:
            return JsonResponse({"error": "Empty response from OpenAI API"}, status=500)

        # Clean the output if it's wrapped in markdown code fences.
        if output.startswith("```json"):
            output = output[len("```json") :].strip()
        if output.endswith("```"):
            output = output[:-3].strip()

        try:
            result = json.loads(output)
        except json.JSONDecodeError as decode_error:
            error_message = (
                f"JSON decoding error: {str(decode_error)}. OpenAI API output: {output}"
            )
            print(error_message)
            return JsonResponse({"error": error_message}, status=500)

        return JsonResponse(result)

    except Exception as e:
        print(f"Error in tune_resume: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


import logging
import sys

# Configure logging at the top of your file
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)


@csrf_exempt
def generate_pdf(request):
    """
    Expects a POST request with a JSON body containing a 'latex' field.
    Compiles the provided LaTeX code into a PDF using pdflatex only.
    """
    try:
        data = json.loads(request.body)
        latex_code = data.get("latex")
        logger.debug(f"Received LaTeX code: {latex_code[:100]}...")

        if not latex_code:
            return JsonResponse({"error": "LaTeX code is required"}, status=400)

        # Fix the titlesec formatting issue
        if "\\usepackage{titlesec}" in latex_code and "\\titleformat" not in latex_code:
            # Add proper section formatting configuration
            title_format = r"""
\titleformat{\section}
  {\normalfont\Large\bfseries}  % format
  {}                            % label
  {0em}                         % sep
  {}                            % before-code
"""
            latex_code = latex_code.replace(
                "\\usepackage{titlesec}", "\\usepackage{titlesec}\n" + title_format
            )
            logger.debug("Added titlesec formatting configuration")

        # Write LaTeX to file
        with open("resume.tex", "w", encoding="utf-8") as f:
            f.write(latex_code)
        logger.debug("LaTeX file written successfully")

        # Use only pdflatex for compilation
        compile_cmd = "pdflatex -interaction=nonstopmode resume.tex"
        logger.debug(f"Running command: {compile_cmd}")
        compile_result = os.system(compile_cmd)
        logger.debug(f"Compilation result code: {compile_result}")

        if compile_result != 0:
            if os.path.exists("resume.log"):
                with open("resume.log", "r", encoding="utf-8") as log_file:
                    log_output = log_file.read()
                    logger.error(f"LaTeX compilation failed: {log_output[:1000]}...")
                    return JsonResponse(
                        {"error": "LaTeX compilation failed", "details": log_output},
                        status=500,
                    )
            return JsonResponse({"error": "LaTeX compilation failed"}, status=500)

        # Check if PDF exists
        if not os.path.exists("resume.pdf"):
            logger.error("PDF file was not created")
            return JsonResponse({"error": "PDF file not created"}, status=500)

        logger.debug("PDF file created successfully")

        # Read compiled PDF
        with open("resume.pdf", "rb") as f:
            pdf_data = f.read()

        logger.debug(f"Read {len(pdf_data)} bytes of PDF data")

        response = HttpResponse(pdf_data, content_type="application/pdf")
        response["Content-Disposition"] = 'inline; filename="resume.pdf"'
        return response

    except Exception as e:
        logger.exception(f"Error in generate_pdf: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def test_pdf(request):
    """Simple test endpoint to generate a basic PDF"""
    try:
        logger.debug("Testing basic PDF generation")

        # Create a basic LaTeX document
        latex_content = r"""
\documentclass{article}
\begin{document}
This is a test PDF document.
\end{document}
"""

        # Write to file
        with open("test.tex", "w") as f:
            f.write(latex_content)

        # Compile
        logger.debug("Compiling test.tex")
        result = os.system("pdflatex -interaction=nonstopmode test.tex")
        logger.debug(f"Compilation result: {result}")

        # Check if PDF exists
        if os.path.exists("test.pdf"):
            logger.debug("test.pdf was created successfully")
            with open("test.pdf", "rb") as f:
                pdf_data = f.read()

            response = HttpResponse(pdf_data, content_type="application/pdf")
            response["Content-Disposition"] = 'inline; filename="test.pdf"'
            return response
        else:
            logger.debug("test.pdf was NOT created")
            return JsonResponse({"error": "PDF generation failed"}, status=500)
    except Exception as e:
        logger.exception("Error in test_pdf")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@login_required
def get_user_info(request):
    """Return basic information about the logged-in user"""
    user = request.user

    try:
        account = Account.objects.get(user=user)
        avatar_url = None
        if account.avatar_hash:
            discord_uid = account.discord_uid
            avatar_hash = account.avatar_hash
            avatar_url = (
                f"https://cdn.discordapp.com/avatars/{discord_uid}/{avatar_hash}.png"
            )

        return JsonResponse(
            {"username": user.username, "email": user.email, "avatar_url": avatar_url}
        )
    except Account.DoesNotExist:
        return JsonResponse(
            {"username": user.username, "email": user.email, "avatar_url": None}
        )


@csrf_exempt
@login_required
def list_applications(request):
    """Get all job applications for the current user"""
    applications = JobApplication.objects.filter(user=request.user).order_by(
        "-create_date"
    )
    data = []

    for app in applications:
        data.append(
            {
                "id": app.id,
                "name": app.name,
                "url": app.url,
                "resume": app.resume,
                "status": app.status,
                "comments": app.comments,
                "create_date": app.create_date,
            }
        )

    return JsonResponse(data, safe=False)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
@login_required
def application_detail(request, app_id):
    """Handle retrieval, updates, and deletion for a specific application"""
    try:
        app = JobApplication.objects.get(id=app_id, user=request.user)
    except JobApplication.DoesNotExist:
        return JsonResponse({"error": "Application not found"}, status=404)

    if request.method == "GET":
        data = {
            "id": app.id,
            "name": app.name,
            "url": app.url,
            "resume": app.resume,
            "status": app.status,
            "comments": app.comments,
            "create_date": app.create_date,
        }
        return JsonResponse(data)

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)

            # Update fields
            app.name = data.get("name", app.name)
            app.url = data.get("url", app.url)
            app.status = data.get("status", app.status)
            app.comments = data.get("comments", app.comments)

            # Only update resume URL if provided
            if "resume" in data and data["resume"]:
                app.resume = data["resume"]

            app.save()

            # Return updated data
            return JsonResponse(
                {
                    "id": app.id,
                    "name": app.name,
                    "url": app.url,
                    "resume": app.resume,
                    "status": app.status,
                    "comments": app.comments,
                    "create_date": app.create_date,
                }
            )
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    elif request.method == "DELETE":
        app.delete()
        return JsonResponse({"message": "Application deleted successfully"})


@csrf_exempt
@login_required
def save_application(request):
    """Save a new job application"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)

        # Create new application
        application = JobApplication(
            user=request.user,
            name=data.get("name"),
            url=data.get("url", ""),
            resume=data.get("resume"),
            status="SUB",  # Default to Submitted
            comments="",
        )
        application.save()

        return JsonResponse(
            {"id": application.id, "message": "Application saved successfully"},
            status=201,
        )
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
