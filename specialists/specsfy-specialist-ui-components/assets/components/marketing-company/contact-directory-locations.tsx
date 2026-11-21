export default function Example() {
  return (
    <div className="bg-white py-8 sm:py-16 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl divide-y divide-gray-100 lg:mx-0 lg:max-w-none dark:divide-white/10">
          <div className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-3">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
                Entre em contato
              </h2>
              <p className="mt-4 text-base/7 text-gray-600 dark:text-gray-400">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
              {[
                ['Collaborate', 'collaborate@example.com', '+1 (555) 905-2345'],
                ['Imprensa', 'press@example.com', '+1 (555) 905-3456'],
                ['Faça parte da nossa equipe', 'careers@example.com', '+1 (555) 905-4567'],
                ['Diga olá', 'hello@example.com', '+1 (555) 905-5678'],
              ].map(([label, email, phone]) => (
                <div key={label} className="rounded-2xl bg-gray-50 p-10 dark:bg-gray-800/50">
                  <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">{label}</h3>
                  <dl className="mt-3 space-y-1 text-sm/6 text-gray-600 dark:text-gray-400">
                    <div>
                      <dt className="sr-only">E-mail</dt>
                      <dd>
                        <a href={`mailto:${email}`} className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {email}
                        </a>
                      </dd>
                    </div>
                    <div className="mt-1">
                      <dt className="sr-only">Telefone</dt>
                      <dd>{phone}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-3">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
                Localizações
              </h2>
              <p className="mt-4 text-base/7 text-gray-600 dark:text-gray-400">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
              {[
                ['Los Angeles', '4556 Brendan Ferry', 'Los Angeles, CA 90210'],
                ['New York', '886 Walter Street', 'New York, NY 12345'],
                ['Toronto', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
                ['Chicago', '726 Mavis Island', 'Chicago, IL 60601'],
              ].map(([city, line1, line2]) => (
                <div key={city} className="rounded-2xl bg-gray-50 p-10 dark:bg-gray-800/50">
                  <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">{city}</h3>
                  <address className="mt-3 space-y-1 text-sm/6 text-gray-600 not-italic dark:text-gray-400">
                    <p>{line1}</p>
                    <p>{line2}</p>
                  </address>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
