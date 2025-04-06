from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
from openai import OpenAI
from pylatex import Document, NoEscape


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


@csrf_exempt
def generate_pdf(request):
    """
    Expects a POST request with a JSON body containing a 'latex' field.
    Uses pylatex to compile the provided LaTeX code into a PDF and returns it.
    """
    try:
        data = json.loads(request.body)
        latex_code = data.get("latex")
        if not latex_code:
            return JsonResponse({"error": "Latex code is required"}, status=400)

        # Create a new LaTeX document.
        # You can adjust the documentclass and preamble as needed.
        doc = Document(documentclass="article")
        # Optionally, add any required packages.
        doc.preamble.append(NoEscape(r"\usepackage[utf8]{inputenc}"))
        # Append the user's LaTeX code inside the document.
        doc.append(NoEscape(latex_code))

        try:
            # Generate the PDF using pdflatex.
            # This returns the output path of the generated PDF.
            output_path = doc.generate_pdf(clean_tex=True, compiler="pdflatex")
        except Exception as compile_error:
            error_msg = f"LaTeX compilation error: {str(compile_error)}"
            print(error_msg)
            return JsonResponse({"error": error_msg}, status=500)

        # Read the generated PDF file.
        with open(output_path, "rb") as f:
            pdf_data = f.read()

        # Return the PDF as an inline response.
        response = HttpResponse(pdf_data, content_type="application/pdf")
        response["Content-Disposition"] = 'inline; filename="tuned_resume.pdf"'
        return response

    except Exception as e:
        print(f"Error in generate_pdf: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
