import { getSession } from "~/services/session-server"
import type { Route } from "../+types/sign-in"
import { redirect } from "react-router"
import { collectService } from "~/services/collect-service"
import { ibgeService } from "~/services/ibge-service"

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  )

  if (!session.get("token")) return redirect("/sign-in")

  const { status, data, errors } = await collectService.getItems({
    token: session.data.token!
  })

  const ufs = await ibgeService.states()

  if (!status) return { errors }

  return {
    items: data,
    ufs
  }
}
