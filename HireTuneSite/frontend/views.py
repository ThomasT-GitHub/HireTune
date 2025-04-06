from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from openai import OpenAI
from pylatex import Document, NoEscape
from django.http import HttpResponse
from django.views import View


def index(request):
    return render(request, "frontend/index.html")


def tuner(request):
    return render(request, "frontend/tuner.html")


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
            "You are an elite technical résumé editor. Your task is to rewrite the candidate’s résumé "
            "in LaTeX so it is laser‑aligned with the job description. Return ONLY valid JSON with a single "
            "field: 'tuned_resume'.\n\n"
            "**Process (follow in order)**\n"
            "1. Extract the 8‑12 most critical skills, technologies, and soft skills from the job description.\n"
            "2. For each requirement, mark whether the current résumé covers it strongly, weakly, or not at all.\n"
            "3. Rewrite & re‑organize the résumé:\n"
            "   • Re‑order sections so the most relevant experience appears first.\n"
            "   • Rewrite bullet points using active verbs and quantified impact (%, $, latency, users, etc.).\n"
            "   • Naturally inject keywords from step 1; avoid keyword stuffing.\n"
            "   • Keep ≤ 5 bullets per role; trim irrelevant content.\n"
            "   • Surface transferable evidence when a requirement is missing.\n"
            "4. Polish:\n"
            "   • Maintain valid LaTeX syntax and consistent tense (present for current role, past for previous).\n"
            "   • Keep résumé ≤ 1 page if possible (2 max).\n"
            "   • No first‑person pronouns.\n\n"
            "**Output Format**\n"
            '{\\n  \\"tuned_resume\\": \\"<FULL LaTeX OF THE REWRITTEN RÉSUMÉ>\\"\\n}\n\n'
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
