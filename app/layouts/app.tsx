import { useFetcher, NavLink, Outlet, redirect } from "react-router"
import { Route } from "./+types/app"
import { commitSession, destroySession, getSession } from "~/services/session-server"

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  )

  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await destroySession(session),
    }
  })
}

export default function App({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher()

  return (
    <main className="">
      <header className="h-[50px] flex px-5 md:px-0">
        <nav className="container m-auto">
          <ul className="flex justify-end gap-5">
            <li className="flex gap-5">
              <NavLink to="/home">
                Home
              </NavLink>
              <NavLink to="/new-point">
                Novo ponto de coleta
              </NavLink>
            </li>
            <li>
              <fetcher.Form method="POST">
                <button
                  type="submit"
                  className="bg-red-400 py-1 px-3 rounded-md text-white">
                  Sair
                </button>
              </fetcher.Form>
            </li>
          </ul>
        </nav>
        {fetcher.data?.errors && (
          <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">{fetcher.data.errors}</p>
        )}
      </header>
      <div className="container m-auto px-5 md:px-0">
        <Outlet />
      </div>
    </main>
  )
}
