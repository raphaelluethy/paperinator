EXTRACTION_PROMPT = """
Extract the following information from the given text. Return the results in a JSON format:

Required fields:
- title: The title of the paper
- authors: List of authors
- publication_year: Year of publication
- abstract: The paper's abstract
- summary: A summary of the paper
- keywords: List of keywords if present
- research_questions: List of research questions if present
- challenges_and_gaps: List of identified challenges and gaps if present
- novelties: List of novelties if present
- main_findings: List of main findings if present
- contributions: List of contributions if present
- limitations: List of limitations if present
- future_work: List of future work if present
- recommendations: List of recommendations if present
- conclusion: The conclusion of the paper

Text:
{text}

Return only the JSON object without any additional text.
"""
