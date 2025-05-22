import {getRandomElement, getRandomInt} from './helpers';

export class QuizModel<QuestionType, AnswerType, ParamsType> {
  public title: string;
  public generator: (params: ParamsType) => QuestionType;
  public evaluator: (question: QuestionType, answer: AnswerType) => boolean;

  public constructor(
    title: string,
    generator: (params: ParamsType) => QuestionType,
    evaluator: (question: QuestionType, answer: AnswerType) => boolean,
  ) {
    this.title = title;
    this.generator = generator;
    this.evaluator = evaluator;
  }
}

// Division not supported yet.
export type ArithmeticOperator = 'add' | 'sub' | 'mult';

export type ArithmeticQuestion = {
  kind: 'arithmetic';
  term1: number;
  term2: number;
  operator: ArithmeticOperator;
};

// Classify difficult using minimum and maximum terms
export type ArithmeticParams = {
  kind: 'arithmetic';
  minTerm: number;
  maxTerm: number;
};

export type ArithmeticAnswer = {
  kind: 'arithmetic';
  result: number;
};

// TODO: Support subtraction and division
const arithmeticGenerator = (params: ArithmeticParams): ArithmeticQuestion => ({
  kind: 'arithmetic',
  term1: getRandomInt(params.minTerm, params.maxTerm),
  term2: getRandomInt(params.minTerm, params.maxTerm),
  operator: getRandomElement<ArithmeticOperator>(['add', 'mult']),
});

const arithmeticEvaluator = (
  question: ArithmeticQuestion,
  answer: ArithmeticAnswer,
): boolean => {
  if (question.operator === 'add') {
    return question.term1 + question.term2 === answer.result;
  } else if (question.operator === 'mult') {
    return question.term1 * question.term2 === answer.result;
  }
};

export const arithmeticQuiz: QuizModel<
  ArithmeticQuestion,
  ArithmeticAnswer,
  ArithmeticParams
> = new QuizModel<ArithmeticQuestion, ArithmeticAnswer, ArithmeticParams>(
  'Arithmetic Quiz',
  arithmeticGenerator,
  arithmeticEvaluator,
);

// Union of all possible types
export type QuestionType = ArithmeticQuestion;
export type AnswerType = ArithmeticAnswer;
export type ParamsType = ArithmeticParams;

// Question response states
export type QuestionResponseState =
  | 'unanswered'
  | 'correct'
  | 'incorrect'
  | 'timeout';
