const faqs = [
  {
    id: 1,
    question: "Qual é a melhor coisa sobre a Suíça?",
    answer:
      "Não sei, mas a bandeira é um grande diferencial.",
  },
  {
    id: 2,
    question: 'Como se faz água benta?',
    answer:
      'Ferva até ficar pronta.',
  },
  {
    id: 3,
    question: 'Por que nunca vemos elefantes escondidos em árvores?',
    answer:
      "Porque eles são muito bons nisso.",
  },
  {
    id: 4,
    question: 'Como se chama alguém sem corpo e sem nariz?',
    answer: 'Ninguém sabe.',
  },
  {
    id: 5,
    question: "Por que não ouvimos um pterodáctilo indo ao banheiro?",
    answer:
      'Porque ele vai em silêncio.',
  },
  {
    id: 6,
    question: 'Por que o homem invisível recusou a oferta de trabalho?',
    answer:
      "Ele não conseguia se imaginar nessa função. A equipe buscava uma pessoa com outro perfil para o desafio.",
  },
]

export default function Example() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Perguntas frequentes
          </h2>
          <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">
            Tem outra pergunta e não encontrou a resposta? Fale com nossa equipe de suporte por{' '}
            <a
              href="#"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              enviar um email
            </a>{' '}
            e responderemos o mais rápido possível.
          </p>
        </div>
        <div className="mt-20">
          <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-x-6 sm:gap-y-16 lg:gap-x-10">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">{faq.question}</dt>
                <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
