from app.utils.question_parser import QuestionParser, parse_questions_from_text


def test_parser_extracts_explanation_when_present():
    text = """Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation: Because 2 + 2 equals 4.
"""

    result = parse_questions_from_text(text)

    assert result["total_questions"] == 1
    assert result["questions"][0]["explanation"] == "Because 2 + 2 equals 4."
    assert result["questions"][0]["warnings"] == []


def test_parser_sets_explanation_to_none_for_format_a_questions():
    text = """Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
"""

    result = parse_questions_from_text(text)

    assert result["total_questions"] == 1
    assert result["questions"][0]["explanation"] is None
    assert result["questions"][0]["warnings"] == []


def test_parser_detects_empty_explanation_warning():
    text = """Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation:
"""

    result = parse_questions_from_text(text)

    assert result["questions"][0]["explanation"] is None
    assert any(w["type"] == "empty_explanation" for w in result["questions"][0]["warnings"])


def test_parser_validates_explanation_length():
    long_text = "Explanation: " + "x" * 1001
    text = f"""Question 1
What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
{long_text}
"""

    result = parse_questions_from_text(text)

    assert any(w["type"] == "explanation_too_long" for w in result["questions"][0]["warnings"])
