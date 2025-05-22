import './styles.css';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import mathBg from '../Static/backgrounds/math.jpg';
import petSad from '../Static/pets/sad_idle.png';
import petNeutral from '../Static/pets/neutral_idle.png';
import petExcited from '../Static/pets/excited_idle.png';
import {Link, useParams} from 'react-router';
import {Button, InputGroup} from 'react-bootstrap/esm';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {useState, useMemo, ChangeEvent, FormEvent} from 'react';
import {
  arithmeticQuiz,
  QuizModel,
  QuestionType,
  AnswerType,
  ParamsType,
  ArithmeticParams,
  ArithmeticOperator,
  QuestionResponseState,
} from './model';
import Form from 'react-bootstrap/Form';

export default function GymView() {
  return (
    <div id="gym-container">
      <h2>Study Gym</h2>
      <p>
        Keep your mind fit by completing these brain activities every day with
        your pet.
      </p>
      <Row xs={1} md={2} className="g-4">
        <Col>
          <Link to="/gym/arithmetic">
            <Card className="bg-dark text-white card-bg-crop">
              <Card.Img className="img-overlay" src={mathBg} alt="Card image" />
              <div className="dark-overlay"></div>
              <Card.Body>
                <h1>Arithmetic</h1>
                <i className="right-icon bi bi-arrow-right-circle-fill"></i>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}

type QuestionLoaderProps = {
  quizType: string;
  question: QuestionType;
  onQuestionSubmit: (answer: AnswerType) => void;
};

function operatorSignFrom(operator: ArithmeticOperator) {
  if (operator === 'add') return <>&#43;</>;
  else if (operator === 'mult') return <>&times;</>;
}

function QuestionLoader({
  quizType,
  question,
  onQuestionSubmit,
}: QuestionLoaderProps) {
  const [answer, setAnswer] = useState<string>('');
  const updateAnswer = (event: ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
  };
  // Verify quiz type is correct
  if (question.kind !== quizType) {
    return <p>ERROR- quiz type invalid (report bug to developers).</p>;
  }
  if (quizType === 'arithmetic') {
    const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onQuestionSubmit({
        kind: quizType,
        result: parseInt(answer),
      });
      setAnswer('');
    };
    return (
      <Form
        className="arithmetic-question"
        onSubmit={submitQuestion}
        style={{width: '250px'}}
      >
        <InputGroup className="mb-3">
          <InputGroup.Text>
            {question.term1} {operatorSignFrom(question.operator)}{' '}
            {question.term2} ={' '}
          </InputGroup.Text>
          <Form.Control
            type="number"
            placeholder="?"
            value={answer === undefined ? '' : answer}
            onChange={updateAnswer}
          ></Form.Control>
          <Button>Submit</Button>
        </InputGroup>
      </Form>
    );
  }
  return <p>ERROR- quiz type not found.</p>;
}

function responseStateToPetImg(responseState: QuestionResponseState) {
  if (responseState === 'unanswered') {
    return petNeutral;
  } else if (responseState === 'correct') {
    return petExcited;
  } else {
    return petSad;
  }
}

const quizzes: {
  [quizType: string]: QuizModel<QuestionType, AnswerType, ParamsType>;
} = {
  arithmetic: arithmeticQuiz,
};

export function QuizView() {
  const {quizType} = useParams();
  const quiz = quizzes[quizType];
  // Only supports arithmetic (need to get correct params for any quiz)
  const quizParams: ArithmeticParams = {
    kind: 'arithmetic',
    minTerm: 0,
    maxTerm: 10,
  };
  // Keep track of accurcy
  const [correct, setCorrect] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const accuracy = useMemo(
    () => Math.ceil((total === 0 ? 0 : correct / total) * 100),
    [correct, total],
  );
  // Load correct question
  const [question, setQuestion] = useState<QuestionType>(
    quiz.generator(quizParams),
  );
  const [responseState, setResponseState] =
    useState<QuestionResponseState>('unanswered');
  const loadQuestion = () => {
    setQuestion(quiz.generator(quizParams));
  };
  const onQuestionSubmit = (answer: AnswerType) => {
    // Ensure the type is correct
    if (answer.kind !== quizType) {
      throw new Error('Incorrect quiz type');
    }
    // Evaluate the submission
    const isCorrect = quiz.evaluator(question, answer);
    if (isCorrect) {
      // Award point
      setCorrect(correct + 1);
    }
    // Add question to total
    setTotal(total + 1);
    // Trigger intermediate state
    setResponseState(isCorrect ? 'correct' : 'incorrect');
    // Update question shortly
    setTimeout(() => {
      loadQuestion();
      setResponseState('unanswered');
    }, 2000);
  };
  return (
    <div id="quiz-container">
      <Link to="/gym">
        <Button size="sm" variant="outline-secondary">
          <i className="bi bi-arrow-left-circle-fill"></i> Return
        </Button>
      </Link>
      <h2 className="mt-3">{quiz.title}</h2>
      <p>Spend 5 minutes a day training your arithmetic to win a reward!</p>
      <p>Difficulty will increase based on your training performance.</p>
      <ProgressBar
        className="mb-3"
        now={accuracy}
        label={`${accuracy}%`}
        variant="success"
      />
      {responseState === 'unanswered' ? (
        <QuestionLoader
          quizType={quizType}
          question={question}
          onQuestionSubmit={onQuestionSubmit}
        />
      ) : responseState === 'timeout' ? (
        <p>Out of time...</p>
      ) : responseState === 'correct' ? (
        <h3>Correct!</h3>
      ) : (
        <h3>Incorrect.</h3>
      )}
      <img src={responseStateToPetImg(responseState)} width={200} />
    </div>
  );
}
