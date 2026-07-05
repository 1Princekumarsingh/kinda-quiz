import { useState, useEffect, useCallback, useRef } from 'react'
import { QuizState, QuizAnswer, QuizQuestion, QuizConfig, ConfidenceLevel } from '@/types/quiz'

function createInitialAnswers(questions: QuizQuestion[]): Map<number, QuizAnswer> {
  const initialAnswers = new Map<number, QuizAnswer>()
  questions.forEach(q => {
    initialAnswers.set(q.id, {
      question_id: q.id,
      selected_answer: null,
      time_spent: 0,
      is_bookmarked: false,
      is_visited: false
    })
  })
  return initialAnswers
}

function createFreshState(config: QuizConfig, questions: QuizQuestion[]): QuizState {
  return {
    config,
    questions,
    answers: createInitialAnswers(questions),
    current_question_index: 0,
    start_time: Date.now(),
    elapsed_time: 0,
    is_paused: false,
    is_completed: false
  }
}

function normalizeState(state: QuizState, config: QuizConfig, questions: QuizQuestion[]): QuizState {
  const normalizedQuestions = state.questions?.length ? state.questions : questions
  const maxIndex = Math.max(normalizedQuestions.length - 1, 0)
  const currentIndex = Number.isFinite(state.current_question_index)
    ? Math.min(Math.max(state.current_question_index, 0), maxIndex)
    : 0

  return {
    ...state,
    config: state.config ?? config,
    questions: normalizedQuestions,
    current_question_index: currentIndex
  }
}

export function useQuizState(initialConfig: QuizConfig, questions: QuizQuestion[], initialState?: QuizState) {
  // Use a ref to track if this is the first render with initialState
  const hasRestoredState = useRef(!!initialState)
  
  const [state, setState] = useState<QuizState>(() => {
    return initialState ? normalizeState(initialState, initialConfig, questions) : createFreshState(initialConfig, questions)
  })

  useEffect(() => {
    // If we restored state on initial render, don't reset it
    if (hasRestoredState.current && initialState) {
      return
    }
    
    if (initialState) {
      setState(normalizeState(initialState, initialConfig, questions))
      hasRestoredState.current = true
      return
    }
    
    // Only create fresh state if we haven't restored state
    if (!hasRestoredState.current) {
      setState(createFreshState(initialConfig, questions))
    }
  }, [initialConfig, questions, initialState])

  const clearSavedState = useCallback(() => {
    // Progress is persisted via backend storage rather than localStorage.
  }, [])

  // Navigate to question
  const goToQuestion = useCallback((index: number) => {
    setState(prev => {
      if (index < 0 || index >= prev.questions.length) return prev
      return {
        ...prev,
        current_question_index: index
      }
    })
  }, [])

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    setState(prev => {
      if (prev.current_question_index >= prev.questions.length - 1) return prev
      return {
        ...prev,
        current_question_index: prev.current_question_index + 1
      }
    })
  }, [])

  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    setState(prev => {
      if (prev.current_question_index <= 0) return prev
      return {
        ...prev,
        current_question_index: prev.current_question_index - 1
      }
    })
  }, [])

  // Select answer
  const selectAnswer = useCallback((questionId: number, answer: string | null) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const current = newAnswers.get(questionId)
      if (current) {
        newAnswers.set(questionId, {
          ...current,
          selected_answer: answer,
          is_visited: true
        })
      }
      return { ...prev, answers: newAnswers }
    })
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((questionId: number) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const current = newAnswers.get(questionId)
      if (current) {
        newAnswers.set(questionId, {
          ...current,
          is_bookmarked: !current.is_bookmarked
        })
      }
      return { ...prev, answers: newAnswers }
    })
  }, [])

  // Mark question as visited
  const markVisited = useCallback((questionId: number) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const current = newAnswers.get(questionId)
      if (current && !current.is_visited) {
        newAnswers.set(questionId, {
          ...current,
          is_visited: true
        })
      }
      return { ...prev, answers: newAnswers }
    })
  }, [])

  // Update time spent on current question
  const updateTimeSpent = useCallback((questionId: number, seconds: number) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const current = newAnswers.get(questionId)
      if (current) {
        newAnswers.set(questionId, {
          ...current,
          time_spent: current.time_spent + seconds
        })
      }
      return { ...prev, answers: newAnswers }
    })
  }, [])

  // Complete quiz
  const completeQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      is_completed: true,
      elapsed_time: Math.floor((Date.now() - prev.start_time) / 1000)
    }))
    clearSavedState()
  }, [clearSavedState])

  // Set confidence level
  const setConfidence = useCallback((questionId: number, confidence: ConfidenceLevel) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const current = newAnswers.get(questionId)
      if (current) {
        newAnswers.set(questionId, {
          ...current,
          confidence_level: confidence
        })
      }
      return { ...prev, answers: newAnswers }
    })
  }, [])

  // Get current question
  const currentQuestion = state.questions[state.current_question_index]
  const currentAnswer = currentQuestion ? state.answers.get(currentQuestion.id) : null

  // Calculate stats
  const stats = {
    total: state.questions.length,
    answered: Array.from(state.answers.values()).filter(a => a.selected_answer !== null).length,
    bookmarked: Array.from(state.answers.values()).filter(a => a.is_bookmarked).length,
    visited: Array.from(state.answers.values()).filter(a => a.is_visited).length,
    unanswered: Array.from(state.answers.values()).filter(a => a.selected_answer === null).length
  }

  return {
    state,
    currentQuestion,
    currentAnswer,
    stats,
    actions: {
      goToQuestion,
      nextQuestion,
      previousQuestion,
      selectAnswer,
      toggleBookmark,
      markVisited,
      updateTimeSpent,
      completeQuiz,
      clearSavedState,
      setConfidence
    }
  }
}
