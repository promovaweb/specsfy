export default function Example() {
  return (
    <section className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col pb-10 sm:pb-16 lg:pr-8 lg:pb-0 xl:pr-20">
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/tuple-logo-gray-900.svg"
              className="h-12 self-start dark:hidden"
            />
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/tuple-logo-white.svg"
              className="h-12 self-start not-dark:hidden"
            />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg/8 text-gray-900 dark:text-gray-100">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="size-14 rounded-full bg-gray-50 dark:bg-gray-800"
                />
                <div className="text-base">
                  <div className="font-semibold text-gray-900 dark:text-white">Judith Black</div>
                  <div className="mt-1 text-gray-500 dark:text-gray-400">CEO da Tuple</div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col border-t border-gray-900/10 pt-10 sm:pt-16 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:pl-20 dark:border-white/10">
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/reform-logo-gray-900.svg"
              className="h-12 self-start dark:hidden"
            />
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/reform-logo-white.svg"
              className="h-12 self-start not-dark:hidden"
            />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg/8 text-gray-900 dark:text-gray-100">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  className="size-14 rounded-full bg-gray-50 dark:bg-gray-800"
                />
                <div className="text-base">
                  <div className="font-semibold text-gray-900 dark:text-white">Joseph Rodriguez</div>
                  <div className="mt-1 text-gray-500 dark:text-gray-400">CEO da Reform</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
