// Demo data for the admin Quiz module — no backend yet, so responses are
// hardcoded here. Each `answers` entry maps a question id (see
// constants/quiz.js) to the selected option id, same shape the real
// submission payload will use.
export const mockQuizResponses = [
  {
    id: "resp-1",
    email: "rodri.595@hotmail.com",
    submittedAt: Date.now() - 1000 * 60 * 60 * 6,
    answers: {
      q1: "q1-b",
      q2: "q2-b",
      q3: "q3-b",
      q4: "q4-b",
    },
  },
];
