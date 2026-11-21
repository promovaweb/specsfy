const faqs = [
  {
    id: 1,
    question: "Qual é a melhor coisa sobre a Suíça?",
    answer:
      "Não sei, mas a bandeira é um grande diferencial.",
  },
  {
    id: 2,
    question: 'Por que nunca vemos elefantes escondidos em árvores?',
    answer:
      "Porque eles são muito bons nisso.",
  },
  {
    id: 3,
    question: 'Como se faz água benta?',
    answer:
      'Ferva até ficar pronta.',
  },
  {
    id: 4,
    question: "Por que não ouvimos um pterodáctilo indo ao banheiro?",
    answer:
      'Porque ele vai em silêncio.',
  },
  {
    id: 5,
    question: 'Como se chama alguém sem corpo e sem nariz?',
    answer: 'Ninguém sabe.',
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
    <div className="bg-indigo-700">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Perguntas frequentes</h2>
        <div className="mt-6 border-t border-indigo-300/25 pt-10">
          <dl className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-12">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="text-lg/6 font-medium text-white">{faq.question}</dt>
                <dd className="mt-2 text-base text-indigo-200">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
