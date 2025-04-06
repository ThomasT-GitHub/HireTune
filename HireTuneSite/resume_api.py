# views.py
import json
from django.http import JsonResponse
from openai import OpenAI
from decouple import config

def tailor_resume(request):
    if request.method == "POST":
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            resume_latex = data.get("resume")
            job_description = data.get("job_description")

            # Check if both fields are provided
            if not resume_latex or not job_description:
                return JsonResponse({"error": "Missing 'resume' or 'job_description' field"}, status=400)

            # Initialize OpenAI client
            client = OpenAI(api_key=config("OPENAI_API_KEY"))

            # Craft the prompt to send to OpenAI
            prompt = f"""
You are a helpful assistant that takes a LaTeX resume and a job description. 
Return a revised LaTeX resume that highlights only the experience and skills relevant to the job, 
and removes any distracting or unrelated information.

Resume (in LaTeX):
{resume_latex}

Job Description:
{job_description}

Tailored LaTeX Resume:
"""

            # Call OpenAI API with the crafted prompt
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You are a professional resume editor."},
                          {"role": "user", "content": prompt}]
            )

            # Get tailored resume from the response
            tailored_resume = response.choices[0].message.content

            # Return the tailored resume as JSON
            return JsonResponse({"tailored_resume": tailored_resume})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
