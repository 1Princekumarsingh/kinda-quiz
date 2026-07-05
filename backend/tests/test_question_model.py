from app.models.question import Question


def test_question_to_dict_includes_explanation_field():
    question = Question(
        chapter_id=1,
        question_number=1,
        question_text="What is 2 + 2?",
        option_a="3",
        option_b="4",
        option_c="5",
        option_d="6",
        correct_answer="B",
        explanation="Because 2 + 2 equals 4.",
    )

    data = question.to_dict()

    assert data["explanation"] == "Because 2 + 2 equals 4."


def test_question_defaults_explanation_to_none():
    question = Question(
        chapter_id=1,
        question_number=1,
        question_text="What is 2 + 2?",
        option_a="3",
        option_b="4",
        option_c="5",
        option_d="6",
        correct_answer="B",
    )

    assert question.explanation is None
    assert question.to_dict()["explanation"] is None
