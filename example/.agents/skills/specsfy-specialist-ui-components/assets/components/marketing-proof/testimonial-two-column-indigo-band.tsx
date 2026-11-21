export default function Example() {
  return (
    <section className="bg-indigo-800">
      <div className="mx-auto max-w-7xl md:grid md:grid-cols-2 md:px-6 lg:px-8">
        <div className="px-6 py-12 md:flex md:flex-col md:border-r md:border-indigo-900 md:py-16 md:pr-10 md:pl-0 lg:pr-16">
          <div className="md:shrink-0">
            <img
              alt="Tuple"
              src="https://tailwindcss.com/mais-assets/img/logos/tuple-logo-indigo-300.svg"
              className="h-12"
            />
          </div>
          <blockquote className="mt-6 md:flex md:grow md:flex-col">
            <div className="relative text-lg font-medium text-white md:grow">
              <svg
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="absolute top-0 left-0 size-8 -translate-x-3 -translate-y-2 transform text-indigo-600"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="relative">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <footer className="mt-8">
              <div className="flex items-start">
                <div className="inline-flex shrink-0 rounded-full border-2 border-white">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-12 rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-base font-medium text-white">Judith Black</div>
                  <div className="text-base font-medium text-indigo-200">CEO da Tuple</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
        <div className="border-t-2 border-indigo-900 px-6 py-12 md:border-t-0 md:border-l md:py-16 md:pr-0 md:pl-10 lg:pl-16">
          <div className="md:shrink-0">
            <img
              alt="Workcation"
              src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-indigo-300.svg"
              className="h-12"
            />
          </div>
          <blockquote className="mt-6 md:flex md:grow md:flex-col">
            <div className="relative text-lg font-medium text-white md:grow">
              <svg
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="absolute top-0 left-0 size-8 -translate-x-3 -translate-y-2 transform text-indigo-600"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="relative">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <footer className="mt-8">
              <div className="flex items-start">
                <div className="inline-flex shrink-0 rounded-full border-2 border-white">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-12 rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-base font-medium text-white">Joseph Rodriguez</div>
                  <div className="text-base font-medium text-indigo-200">CEO da Workcation</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
