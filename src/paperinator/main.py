import os
import json
import logging
import argparse
from pathlib import Path
from .ocr_processor import OCRProcessor
from .llm_processor import LLMProcessor


def setup_logging():
	# Create logs directory if it doesn't exist
	Path("logs").mkdir(exist_ok=True)

	# Configure logging
	logging.basicConfig(
		level=logging.DEBUG,
		format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
		handlers=[
			logging.FileHandler("logs/paperinator.log"),
			logging.StreamHandler(),
		],
	)
	return logging.getLogger(__name__)


def to_camel_case(text):
	# Remove file extension and convert to camel case
	base_name = Path(text).stem
	components = base_name.replace("-", " ").replace("_", " ").split()
	return components[0].lower() + "".join(x.title() for x in components[1:])


def parse_arguments():
	parser = argparse.ArgumentParser(
		description="Process academic papers using OCR and LLM"
	)
	parser.add_argument(
		"--model-provider",
		choices=["openai", "gemini"],
		default="openai",
		help="LLM provider to use (default: openai)",
	)
	parser.add_argument(
		"--model-name",
		type=str,
		help="Specific model name to use (default: provider-specific default)",
	)
	return parser.parse_args()


def main():
	logger = setup_logging()
	logger.info("Starting paperinator processing")

	# Parse command-line arguments
	args = parse_arguments()
	model_provider = args.model_provider
	model_name = args.model_name

	logger.info(f"Using model provider: {model_provider}")
	if model_name:
		logger.info(f"Using model: {model_name}")

	# Get API key from environment based on provider
	if model_provider == "openai":
		api_key = os.getenv("OPENAI_API_KEY")
		if not api_key:
			logger.error("OPENAI_API_KEY environment variable not set")
			raise ValueError("Please set OPENAI_API_KEY environment variable")
	elif model_provider == "gemini":
		api_key = os.getenv("GOOGLE_AI_API_KEY")
		if not api_key:
			logger.error("GOOGLE_AI_API_KEY environment variable not set")
			raise ValueError(
				"Please set GOOGLE_AI_API_KEY environment variable"
			)

	# Create output directories if they don't exist
	json_output_dir = Path("out/json")
	json_output_dir.mkdir(parents=True, exist_ok=True)

	# Initialize processors
	logger.info("Initializing processors")
	ocr = OCRProcessor()
	llm = LLMProcessor(
		api_key, model_provider=model_provider, model_name=model_name
	)

	# Process all files
	results = []
	files = list(ocr.get_files())
	total_files = len(files)
	logger.info(f"Found {total_files} files to process")

	for idx, file_path in enumerate(files, 1):
		logger.info(f"Processing file {idx}/{total_files}: {file_path.name}")

		try:
			# Check for cached JSON result
			json_filename = to_camel_case(file_path.name) + ".json"
			json_path = json_output_dir / json_filename

			if json_path.exists():
				logger.info(
					f"Found cached result for {file_path.name}, loading from {json_path}"
				)
				with open(json_path, "r", encoding="utf-8") as f:
					data = json.load(f)
				results.append(data)
				continue

			# Get OCR text
			logger.debug(f"Running OCR on {file_path.name}")
			text = ocr.process_file(file_path)

			# Extract structured data
			logger.debug(f"Processing text with LLM for {file_path.name}")
			data = llm.process_text(text)
			data["filename"] = file_path.name
			results.append(data)

			# Save individual JSON result
			logger.debug(f"Saving JSON result to {json_path}")
			with open(json_path, "w", encoding="utf-8") as f:
				json.dump(data, f, indent=2, ensure_ascii=False)

		except Exception as e:
			logger.error(
				f"Error processing {file_path.name}: {str(e)}", exc_info=True
			)
			continue

	# Create and save DataFrame
	logger.info("Creating final DataFrame")
	df = llm.create_dataframe(results)
	df.to_csv("out/output.csv", index=False)
	logger.info(
		f"Processed {len(results)} files. Results saved to out/output.csv"
	)
	df.to_json("out/output.json", orient="records", indent=2)
	logger.info(
		f"Processed {len(results)} files. Results saved to out/output.json"
	)


if __name__ == "__main__":
	main()
