const faqs = [
  {
    question: 'Como se faz água benta?',
    answer:
      'Ferva até ficar pronta.',
  },
  {
    question: "Qual é a melhor coisa sobre a Suíça?",
    answer:
      "Não sei, mas a bandeira é um grande diferencial.",
  },
  {
    question: 'Como se chama alguém sem corpo e sem nariz?',
    answer: 'Ninguém sabe.',
  },
  {
    question: 'Por que nunca vemos elefantes escondidos em árvores?',
    answer:
      "Porque eles são muito bons nisso.",
  },
]

export default function Example() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl dark:text-white">
              Perguntas frequentes
            </h2>
            <p className="mt-4 text-base/7 text-pretty text-gray-600 dark:text-gray-400">
              Não encontrou a resposta que procura? Fale com nosso{' '}
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                atendimento ao cliente
              </a>{' '}
              team.
            </p>
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="space-y-10">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">{faq.question}</dt>
                  <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
