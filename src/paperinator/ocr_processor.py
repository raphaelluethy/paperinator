from pathlib import Path
import pytesseract
from pdf2image import convert_from_path
from PIL import Image


class OCRProcessor:
	def __init__(self, input_dir: str = "in"):
		self.input_dir = Path(input_dir)

	def process_file(self, file_path: Path) -> str:
		"""Process a single PDF or image file and return the OCR text."""
		if file_path.suffix.lower() == ".pdf":
			# Convert PDF to images
			images = convert_from_path(file_path)
			text = ""
			for image in images:
				text += pytesseract.image_to_string(image) + "\n"
			return text
		else:
			# Process image directly
			image = Image.open(file_path)
			return pytesseract.image_to_strin(image)

	def get_files(self):
		"""Get all PDF and image files from input directory."""
		supported_formats = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
		return [
			f
			for f in self.input_dir.iterdir()
			if f.is_file() and f.suffix.lower() in supported_formats
		]
