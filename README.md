# Paperinator

A tool for processing academic papers using OCR and LLM capabilities to extract structured information.

ATTENTION: This is a quickly hacked together tool. It is not robust and might not handle all edge cases.
Also, I only tested it with MacOS, if you use Windows youre already a poor soul, this project might add to your suffering, I am sorry.

## Prerequisites

- Python 3.8 or higher
- Tesseract OCR installed on your system
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/raphaelluethy/paperinator.git
cd paperinator
```

2. Install the package and its dependencies using pip:
```bash
pip install .
```

Or if you're using [rye](https://rye-up.com/):
```bash
rye sync
```

## Configuration

1. Set your OpenAI API key as an environment variable:
```bash
export OPENAI_API_KEY='your-api-key-here'
```

## Usage

1. Place your PDF papers in the input directory (by default, the root directory).

2. Run the processor:
```bash
python -m paperinator.main
```

The script will:
- Process all PDF files using OCR
- Extract structured information using LLM
- Save individual JSON results in `out/json/`
- Generate a consolidated CSV file at `out/output.csv`

## Project Structure

- `src/paperinator/`: Source code directory
  - `main.py`: Main execution script
  - `ocr_processor.py`: OCR processing functionality
  - `llm_processor.py`: LLM processing functionality
  - `prompts.py`: LLM prompt templates

## Dependencies

- openai >= 1.61.1
- pytesseract >= 0.3.13
- pdf2image >= 1.17.0
- pandas >= 2.2.3
- pillow >= 11.1.0

## Logging

Logs are written to `logs/paperinator.log` and also displayed in the console.
