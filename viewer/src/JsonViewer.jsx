import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Upload,
} from "lucide-react";

const JsonViewer = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    root: true,
    challenges_and_gaps: false,
    novelties: false,
    main_findings: false,
    contributions: false,
    limitations: false,
    future_work: false,
    authors: false,
    keywords: false,
    recommendations: false,
    research_questions: false,
  });
  const [jsonData, setJsonData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with sample data if needed
  useEffect(() => {
    if (jsonData.length === 0) {
      setJsonData([]);
    }
  }, [jsonData.length]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = JSON.parse(content);

        // Handle both array and single object formats
        if (Array.isArray(parsedData)) {
          setJsonData(parsedData);
        } else {
          setJsonData([parsedData]);
        }

        setCurrentIndex(0);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to parse JSON file. Please check the file format.");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file.");
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Reset expanded sections for new paper
      setExpandedSections({
        root: true,
        challenges_and_gaps: false,
        novelties: false,
        main_findings: false,
        contributions: false,
        limitations: false,
        future_work: false,
        authors: false,
        keywords: false,
        recommendations: false,
        research_questions: false,
      });
    }
  };

  const goToNext = () => {
    if (currentIndex < jsonData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Reset expanded sections for new paper
      setExpandedSections({
        root: true,
        challenges_and_gaps: false,
        novelties: false,
        main_findings: false,
        contributions: false,
        limitations: false,
        future_work: false,
        authors: false,
        keywords: false,
        recommendations: false,
        research_questions: false,
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Group research questions
  const getResearchQuestions = (paper) => {
    const questions = [];
    for (let i = 1; i <= 15; i++) {
      const key = `research_question_${i}`;
      if (paper[key] !== null) {
        questions.push({ number: i, text: paper[key] });
      }
    }
    return questions;
  };

  const renderPaper = (paper) => {
    const researchQuestions = getResearchQuestions(paper);

    return (
      <div
        className={`rounded-lg overflow-hidden shadow-lg ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{paper.title}</h2>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div>
              <span className="text-sm font-medium">Published: </span>
              <span className="text-sm">{paper.publication_year}</span>
            </div>
            <div>
              <button
                onClick={() => toggleSection("authors")}
                className="flex items-center text-sm font-medium"
              >
                {expandedSections.authors ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                Authors
              </button>
              {expandedSections.authors && (
                <div className="mt-1 pl-6">
                  {paper.authors.map((author, index) => (
                    <div key={index} className="text-sm">
                      {author}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Abstract</h3>
            <p className="text-sm mb-4">{paper.abstract}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-sm">{paper.summary}</p>
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("keywords")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.keywords ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Keywords
            </button>
            {expandedSections.keywords && (
              <div className="flex flex-wrap gap-2 mb-2">
                {paper.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded ${darkMode ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-800"}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("challenges_and_gaps")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.challenges_and_gaps ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Challenges and Gaps
            </button>
            {expandedSections.challenges_and_gaps && (
              <ul className="list-disc pl-6 mb-2">
                {paper.challenges_and_gaps.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("novelties")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.novelties ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Novelties
            </button>
            {expandedSections.novelties && (
              <ul className="list-disc pl-6 mb-2">
                {paper.novelties.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("main_findings")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.main_findings ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Main Findings
            </button>
            {expandedSections.main_findings && (
              <ul className="list-disc pl-6 mb-2">
                {paper.main_findings.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("contributions")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.contributions ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Contributions
            </button>
            {expandedSections.contributions && (
              <ul className="list-disc pl-6 mb-2">
                {paper.contributions.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("limitations")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.limitations ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Limitations
            </button>
            {expandedSections.limitations && (
              <ul className="list-disc pl-6 mb-2">
                {paper.limitations.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => toggleSection("future_work")}
              className="flex items-center font-semibold text-lg mb-2"
            >
              {expandedSections.future_work ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              Future Work
            </button>
            {expandedSections.future_work && (
              <ul className="list-disc pl-6 mb-2">
                {paper.future_work.map((item, index) => (
                  <li key={index} className="text-sm mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {paper.recommendations && paper.recommendations.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection("recommendations")}
                className="flex items-center font-semibold text-lg mb-2"
              >
                {expandedSections.recommendations ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                Recommendations
              </button>
              {expandedSections.recommendations && (
                <ul className="list-disc pl-6 mb-2">
                  {paper.recommendations.map((item, index) => (
                    <li key={index} className="text-sm mb-1">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {researchQuestions.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection("research_questions")}
                className="flex items-center font-semibold text-lg mb-2"
              >
                {expandedSections.research_questions ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                Research Questions
              </button>
              {expandedSections.research_questions && (
                <ul className="list-disc pl-6 mb-2">
                  {researchQuestions.map((question, index) => (
                    <li key={index} className="text-sm mb-1">
                      <span className="font-medium">RQ{question.number}: </span>
                      {question.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Conclusion</h3>
            <p className="text-sm">{paper.conclusion}</p>
          </div>
        </div>

        <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs opacity-70">
              Filename: {paper.filename}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Academic Paper Viewer
          </h1>
          <div className="flex items-center space-x-4">
            <label
              className={`flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Upload size={16} />
              <span className="text-sm font-medium">Load JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : jsonData.length === 0 ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            No data available. Please upload a JSON file.
          </div>
        ) : (
          <>
            {/* Navigation controls */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`p-2 rounded-md ${
                  currentIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ArrowLeft size={20} />
              </button>
              <div
                className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Paper {currentIndex + 1} of {jsonData.length}
              </div>
              <button
                onClick={goToNext}
                disabled={currentIndex === jsonData.length - 1}
                className={`p-2 rounded-md ${
                  currentIndex === jsonData.length - 1
                    ? "opacity-50 cursor-not-allowed"
                    : darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {jsonData.length > 0 && currentIndex < jsonData.length && (
              <div className="mb-8">{renderPaper(jsonData[currentIndex])}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JsonViewer;
