export default function Example() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-500),transparent)] dark:opacity-10" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl ring-1 shadow-indigo-600/10 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center dark:bg-gray-900 dark:shadow-indigo-500/5 dark:ring-white/5" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <img
          alt=""
          src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-indigo-600.svg"
          className="mx-auto h-12 dark:hidden"
        />
        <img
          alt=""
          src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-indigo-400.svg"
          className="mx-auto h-12 not-dark:hidden"
        />
        <figure className="mt-10">
          <blockquote className="text-center text-xl/8 font-semibold text-gray-900 sm:text-2xl/9 dark:text-white">
            <p>
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
          </blockquote>
          <figcaption className="mt-10">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="mx-auto size-10 rounded-full"
            />
            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-gray-900 dark:text-white">Judith Black</div>
              <svg width={3} height={3} viewBox="0 0 2 2" aria-hidden="true" className="fill-gray-900 dark:fill-white">
                <circle r={1} cx={1} cy={1} />
              </svg>
              <div className="text-gray-600 dark:text-gray-400">CEO da Workcation</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
