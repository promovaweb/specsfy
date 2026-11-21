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
    question: 'Como se chama alguém sem corpo e sem nariz?',
    answer:
      'Ninguém sabe.',
  },
]

export default function Example() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          Perguntas frequentes
        </h2>
        <dl className="mt-20 divide-y divide-gray-900/10 dark:divide-white/10">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
              <dt className="text-base/7 font-semibold text-gray-900 lg:col-span-5 dark:text-white">{faq.question}</dt>
              <dd className="mt-4 lg:col-span-7 lg:mt-0">
                <p className="text-base/7 text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
