import json
from openai import OpenAI
import pandas as pd
from .prompts import EXTRACTION_PROMPT


class LLMProcessor:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def process_text(self, text: str) -> dict:
        """Process OCR text through LLM and return structured data."""
        response = self.client.chat.completions.create(
            model="o3-mini",
            reasoning_effort="high",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts structured information from academic papers.",
                },
                {"role": "user", "content": EXTRACTION_PROMPT.format(text=text)},
            ],
        )

        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return {}

    def create_dataframe(self, results: list[dict]) -> pd.DataFrame:
        """Convert list of results into a DataFrame."""
        # Process research questions into separate columns
        max_questions = 0

        # First pass to find max number of questions
        for result in results:
            questions = result.get("research_questions", [])
            if isinstance(questions, list):
                max_questions = max(max_questions, len(questions))

        # Second pass to normalize research questions into separate columns
        for result in results:
            questions = result.get("research_questions", [])
            if isinstance(questions, list):
                # Pad with None if fewer questions than max
                padded_questions = questions + [None] * (max_questions - len(questions))
                # Add each question as a separate column
                for i, q in enumerate(padded_questions):
                    result[f"research_question_{i + 1}"] = q
            else:
                # Handle case where research_questions is not a list
                result["research_question_1"] = questions
                for i in range(2, max_questions + 1):
                    result[f"research_question_{i}"] = None

            # Safely remove research_questions if it exists
            if "research_questions" in result:
                del result["research_questions"]

        return pd.DataFrame(results)
