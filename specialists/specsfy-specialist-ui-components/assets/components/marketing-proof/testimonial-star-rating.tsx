import { StarIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <section className="bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
      <figure className="mx-auto max-w-2xl">
        <p className="sr-only">5 de 5 estrelas</p>
        <div className="flex gap-x-1 text-indigo-600 dark:text-indigo-400">
          <StarIcon aria-hidden="true" className="size-5 flex-none" />
          <StarIcon aria-hidden="true" className="size-5 flex-none" />
          <StarIcon aria-hidden="true" className="size-5 flex-none" />
          <StarIcon aria-hidden="true" className="size-5 flex-none" />
          <StarIcon aria-hidden="true" className="size-5 flex-none" />
        </div>
        <blockquote className="mt-10 text-xl/8 font-semibold tracking-tight text-gray-900 sm:text-2xl/9 dark:text-white">
          <p>
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </blockquote>
        <figcaption className="mt-10 flex items-center gap-x-6">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80"
            className="size-12 rounded-full bg-gray-50 dark:bg-gray-800"
          />
          <div className="text-sm/6">
            <div className="font-semibold text-gray-900 dark:text-white">Judith Black</div>
            <div className="mt-0.5 text-gray-600 dark:text-gray-400">CEO da Workcation</div>
          </div>
        </figcaption>
      </figure>
    </section>
  )
}
