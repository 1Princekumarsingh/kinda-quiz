"""
Question Parser Utility
Parses questions from text in standardized format.

Standardized Format:
Question 1
What is the time complexity of binary search?
A. O(n)
B. O(log n)
C. O(n²)
D. O(1)
Answer: B

Question 2
...
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class ValidationError:
    """Validation error for a question"""
    type: str
    message: str
    line: Optional[int] = None


@dataclass
class ParsedQuestion:
    """Parsed question with validation status"""
    number: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    explanation: Optional[str] = None
    errors: List[ValidationError] = None
    warnings: List[ValidationError] = None
    
    @property
    def is_valid(self) -> bool:
        """Check if question has no errors"""
        return len(self.errors) == 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        result = {
            'number': self.number,
            'question_text': self.question_text,
            'option_a': self.option_a,
            'option_b': self.option_b,
            'option_c': self.option_c,
            'option_d': self.option_d,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'is_valid': self.is_valid,
            'errors': [{'type': e.type, 'message': e.message, 'line': e.line} for e in self.errors],
            'warnings': [{'type': w.type, 'message': w.message, 'line': w.line} for w in self.warnings]
        }
        return result


class QuestionParser:
    """Parser for standardized question format"""
    
    # Regex patterns
    QUESTION_NUMBER_PATTERN = re.compile(
        r'^(?:Question\s+)?(\d+)\.?\s*$',
        re.IGNORECASE
    )
    OPTION_PATTERN = re.compile(r'^([A-D])\.\s*(.+)$', re.IGNORECASE)
    ANSWER_PATTERN = re.compile(r'^Answer:\s*([A-D])\s*$', re.IGNORECASE)
    EXPLANATION_PATTERN = re.compile(r'^Explanation:\s*(.*)$', re.IGNORECASE)
    
    def __init__(self, text: str):
        """Initialize parser with text content"""
        self.text = text
        self.lines = [line.rstrip() for line in text.split('\n')]
        self.current_line = 0
        self.questions: List[ParsedQuestion] = []
        self.seen_numbers: set = set()
    
    def parse(self) -> List[ParsedQuestion]:
        """Parse all questions from text"""
        while self.current_line < len(self.lines):
            question = self._parse_single_question()
            if question:
                self.questions.append(question)
        
        return self.questions
    
    def _parse_single_question(self) -> Optional[ParsedQuestion]:
        """Parse a single question"""
        # Skip empty lines
        while self.current_line < len(self.lines) and not self.lines[self.current_line].strip():
            self.current_line += 1
        
        if self.current_line >= len(self.lines):
            return None
        
        # Initialize question data
        question_number = None
        question_text_lines = []
        options = {}
        correct_answer = None
        errors = []
        warnings = []
        start_line = self.current_line
        
        # Parse question number
        line = self.lines[self.current_line].strip()
        match = self.QUESTION_NUMBER_PATTERN.match(line)
        
        if match:
            question_number = int(match.group(1))
            self.current_line += 1
            
            # Check for duplicate question numbers
            if question_number in self.seen_numbers:
                warnings.append(ValidationError(
                    type='duplicate_number',
                    message=f'Question number {question_number} appears multiple times',
                    line=start_line + 1
                ))
            self.seen_numbers.add(question_number)
        else:
            # Auto-assign question number
            question_number = len(self.questions) + 1
            warnings.append(ValidationError(
                type='missing_number',
                message='Question number not found, auto-assigned',
                line=start_line + 1
            ))
        
        # Parse question text (everything until we hit an option or answer)
        while self.current_line < len(self.lines):
            line = self.lines[self.current_line].strip()
            
            if not line:
                self.current_line += 1
                continue
            
            # Check if we've reached options or answer
            if (self.OPTION_PATTERN.match(line) or 
                self.ANSWER_PATTERN.match(line)):
                break
            
            question_text_lines.append(line)
            self.current_line += 1
        
        question_text = ' '.join(question_text_lines).strip()
        
        if not question_text:
            errors.append(ValidationError(
                type='missing_question',
                message='Question text is empty',
                line=start_line + 1
            ))
        
        # Parse options (A, B, C, D)
        while self.current_line < len(self.lines):
            line = self.lines[self.current_line].strip()
            
            if not line:
                self.current_line += 1
                continue
            
            # Check if we've reached the answer
            if self.ANSWER_PATTERN.match(line):
                break
            
            option_match = self.OPTION_PATTERN.match(line)
            if option_match:
                option_letter = option_match.group(1).upper()
                option_text = option_match.group(2).strip()
                options[option_letter] = option_text
                self.current_line += 1
            else:
                # Not an option, might be continuation of previous option or error
                self.current_line += 1
        
        # Validate all options present
        required_options = ['A', 'B', 'C', 'D']
        for opt in required_options:
            if opt not in options:
                errors.append(ValidationError(
                    type='missing_option',
                    message=f'Option {opt} is missing',
                    line=start_line + 1
                ))
                options[opt] = ''  # Set empty string as placeholder
        
        # Parse answer
        while self.current_line < len(self.lines):
            line = self.lines[self.current_line].strip()
            
            if not line:
                self.current_line += 1
                continue
            
            answer_match = self.ANSWER_PATTERN.match(line)
            if answer_match:
                correct_answer = answer_match.group(1).upper()
                self.current_line += 1
                break
            else:
                # Check if this might be the start of next question
                if self.QUESTION_NUMBER_PATTERN.match(line):
                    break
                self.current_line += 1
        
        if not correct_answer:
            errors.append(ValidationError(
                type='missing_answer',
                message='Correct answer is missing',
                line=start_line + 1
            ))
            correct_answer = 'A'  # Default placeholder
        elif correct_answer not in ['A', 'B', 'C', 'D']:
            errors.append(ValidationError(
                type='invalid_answer',
                message=f'Answer must be A, B, C, or D (got {correct_answer})',
                line=start_line + 1
            ))

        explanation = None
        while self.current_line < len(self.lines):
            line = self.lines[self.current_line].strip()

            if not line:
                self.current_line += 1
                continue

            if self.QUESTION_NUMBER_PATTERN.match(line):
                break

            explanation_match = self.EXPLANATION_PATTERN.match(line)
            if explanation_match:
                explanation_text = explanation_match.group(1).strip()
                if not explanation_text:
                    warnings.append(ValidationError(
                        type='empty_explanation',
                        message='Explanation field is empty',
                        line=self.current_line + 1
                    ))
                    self.current_line += 1
                    break

                explanation_lines = [explanation_text]
                self.current_line += 1

                while self.current_line < len(self.lines):
                    next_line = self.lines[self.current_line].strip()

                    if not next_line:
                        self.current_line += 1
                        continue

                    if self.QUESTION_NUMBER_PATTERN.match(next_line):
                        break

                    explanation_lines.append(next_line)
                    self.current_line += 1

                explanation = ' '.join(explanation_lines).strip()
                if len(explanation) > 1000:
                    warnings.append(ValidationError(
                        type='explanation_too_long',
                        message=f'Explanation exceeds 1000 characters ({len(explanation)} chars)',
                        line=self.current_line + 1
                    ))
                break

            break
        
        # Create parsed question
        return ParsedQuestion(
            number=question_number,
            question_text=question_text,
            option_a=options.get('A', ''),
            option_b=options.get('B', ''),
            option_c=options.get('C', ''),
            option_d=options.get('D', ''),
            correct_answer=correct_answer,
            explanation=explanation,
            errors=errors,
            warnings=warnings
        )
    
    def get_summary(self) -> Dict[str, Any]:
        """Get parsing summary statistics"""
        total = len(self.questions)
        valid = sum(1 for q in self.questions if q.is_valid)
        invalid = total - valid
        
        return {
            'total_questions': total,
            'valid_questions': valid,
            'invalid_questions': invalid,
            'questions': [q.to_dict() for q in self.questions]
        }


def parse_questions_from_text(text: str) -> Dict[str, Any]:
    """
    Parse questions from text and return summary with parsed questions.
    
    Args:
        text: Raw text containing questions in standardized format
        
    Returns:
        Dictionary with parsing summary and list of parsed questions
    """
    parser = QuestionParser(text)
    parser.parse()
    return parser.get_summary()
