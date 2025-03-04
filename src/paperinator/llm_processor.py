import json
from openai import OpenAI
import pandas as pd
from .prompts import EXTRACTION_PROMPT
from typing import Literal, Optional

# Add Google Generative AI import
try:
	import google.generativeai as genai
except ImportError:
	genai = None


class LLMProcessor:
	def __init__(
		self,
		api_key: str,
		model_provider: Literal["openai", "gemini"] = "openai",
		model_name: Optional[str] = None,
	):
		"""
		Initialize the LLM processor with the specified model provider.

		Args:
		    api_key: API key for the selected model provider
		    model_provider: Either "openai" or "gemini"
		    model_name: Optional model name to use (defaults to provider-specific default)
		"""
		self.model_provider = model_provider
		self.model_name = model_name

		if model_provider == "openai":
			self.client = OpenAI(api_key=api_key)
			self.default_model = "o3-mini"
		elif model_provider == "gemini":
			if genai is None:
				raise ImportError(
					"Google Generative AI package not installed. Please install with 'pip install google-generativeai'"
				)
			genai.configure(api_key=api_key)
			self.client = genai
			self.default_model = "gemini-2.0-flash"
		else:
			raise ValueError(
				f"Unsupported model provider: {model_provider}. Choose 'openai' or 'gemini'."
			)

	def process_text(self, text: str) -> dict:
		"""Process OCR text through LLM and return structured data."""
		model = self.model_name or self.default_model

		if self.model_provider == "openai":
			return self._process_with_openai(text, model)
		elif self.model_provider == "gemini":
			return self._process_with_gemini(text, model)

	def _process_with_openai(self, text: str, model: str) -> dict:
		"""Process text using OpenAI models."""
		response = self.client.chat.completions.create(
			model=model,
			reasoning_effort="high",
			messages=[
				{
					"role": "system",
					"content": "You are a helpful assistant that extracts structured information from academic papers.",
				},
				{
					"role": "user",
					"content": EXTRACTION_PROMPT.format(text=text),
				},
			],
		)

		try:
			result = response.choices[0].message.content
			assert result is not None
			return json.loads(result)
		except json.JSONDecodeError:
			return {}

	def _process_with_gemini(self, text: str, model: str) -> dict:
		"""Process text using Google Gemini models."""
		try:
			# Configure the model
			generation_config = {
				"temperature": 0.0,  # Low temperature for more deterministic outputs
				"top_p": 0.95,
				"top_k": 0,
				"max_output_tokens": 8192,
			}

			# Create the model
			gemini_model = self.client.GenerativeModel(
				model_name=model, generation_config=generation_config
			)

			# Create the prompt
			system_prompt = "You are a helpful assistant that extracts structured information from academic papers."
			user_prompt = EXTRACTION_PROMPT.format(text=text)

			# Generate content
			response = gemini_model.generate_content(
				[
					{
						"role": "user",
						"parts": [
							{"text": system_prompt + "\n\n" + user_prompt}
						],
					}
				]
			)

			# Extract and parse the JSON response
			result = response.text
			return json.loads(result)
		except Exception as e:
			print(f"Error processing with Gemini: {e}")
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
				padded_questions = questions + [None] * (
					max_questions - len(questions)
				)
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
