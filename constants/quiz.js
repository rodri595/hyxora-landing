// Placeholder content for the identification quiz. Question/option copy and
// the marketing-segment "value" per answer will eventually be editable from
// the admin panel — this hardcoded list is what the admin UI will manage.
export const quizQuestions = [
  {
    id: "q1",
    question: "¿Cuál es tu objetivo?",
    options: [
      { id: "q1-a", label: "Cubrirme de la inflación en mi país", value: "inflation_hedge" },
      { id: "q1-b", label: "Obtener un ingreso extra, un ingreso pasivo con mi dinero ahorrado", value: "passive_income" },
      { id: "q1-c", label: "Realizar una inversión a largo plazo (jubilación, legado, etc)", value: "long_term" },
    ],
  },
  {
    id: "q2",
    question: "¿Conoces el mundo financiero digital?",
    options: [
      { id: "q2-a", label: "No, no tengo nada de experiencia", value: "no_experience" },
      { id: "q2-b", label: "He invertido en plataformas digitales y algún activo digital", value: "some_experience" },
      { id: "q2-c", label: "Conozco el mundo digital, activos, CriptoMonedas y Defi", value: "experienced" },
    ],
  },
  {
    id: "q3",
    question: "¿Qué tipo de inversor eres?",
    options: [
      { id: "q3-a", label: "Soy bastante conservador, prefiero tener todo muy controlado", value: "conservative" },
      { id: "q3-b", label: "Me gusta tener una cartera mixta de productos estables y otros con un poco más de riesgo", value: "balanced" },
      { id: "q3-c", label: "Me gustan las apuestas de grandes márgenes aunque conlleven riesgos en momentos concretos", value: "aggressive" },
    ],
  },
  {
    id: "q4",
    question: "¿Qué capital estás pensando en utilizar?",
    options: [
      { id: "q4-a", label: "Menos de 1000€", value: "under_1000" },
      { id: "q4-b", label: "Entre 1000€ a 10000€", value: "1000_10000" },
      { id: "q4-c", label: "Mas de 10000€", value: "over_10000" },
    ],
  },
];
