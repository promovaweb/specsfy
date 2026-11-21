export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Nossos escritórios
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-400">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {[
            ['Los Angeles', '4556 Brendan Ferry', 'Los Angeles, CA 90210'],
            ['New York', '886 Walter Street', 'New York, NY 12345'],
            ['Toronto', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
            ['London', '114 Cobble Lane', 'London N1 2EF'],
          ].map(([city, line1, line2]) => (
            <div key={city}>
              <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900 dark:border-indigo-500 dark:text-white">
                {city}
              </h3>
              <address className="border-l border-gray-200 pt-2 pl-6 text-gray-600 not-italic dark:border-white/10 dark:text-gray-400">
                <p>{line1}</p>
                <p>{line2}</p>
              </address>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
