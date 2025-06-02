// src/gym/tests/view.test.tsx
import '@testing-library/jest-dom';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
// Use react-router (not react-router-dom) to match your component’s imports
import {MemoryRouter, Routes, Route} from 'react-router';
import {QuizView} from '../view';
import {arithmeticQuiz} from '../model';

describe('QuizView – Submit button behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Spy on the real quiz to make it deterministic
    vi.spyOn(arithmeticQuiz, 'generator').mockReturnValue({
      kind: 'arithmetic',
      term1: 1,
      term2: 2,
      operator: 'add',
    });
    vi.spyOn(arithmeticQuiz, 'evaluator').mockImplementation((_, answer) => {
      return answer.result === 3;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('submits the answer when Submit button is clicked', () => {
    render(
      // This MemoryRouter comes from `react-router`, matching your useParams import
      <MemoryRouter initialEntries={['/gym/arithmetic']}>
        <Routes>
          <Route path="/gym/:quizType" element={<QuizView />} />
        </Routes>
      </MemoryRouter>,
    );

    // Type the correct answer "3"
    fireEvent.change(screen.getByPlaceholderText('?'), {
      target: {value: '3'},
    });

    // Click Submit
    fireEvent.click(screen.getByRole('button', {name: /submit/i}));

    // Expect the "Correct!" message
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });
});
