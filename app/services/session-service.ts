import { redirect } from 'react-router'
import {
  getSession,
  destroySession,
  commitSession,
  SessionDataTypes,
  SessionFlashDataTypes,
  SessionGetTypes
 } from './session-server'

const s = (request: Request) => ({
  get: () => {},
  set: () => {}
})

const session = (request: Request) => ({
  /*redirect: async (request: Request, url: string) => {
    const session = await getSession(
      request.headers.get("Cookie")
    )
    return redirect(url, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    })
  },*/
  get: async (key: SessionGetTypes) => {
    const session = await getSession(
      request.headers.get("Cookie")
    )

    return session.get(key)
  },

  set: async (key: keyof SessionDataTypes, value: any) => {
    const session = await getSession(
      request.headers.get("Cookie")
    )

    session.set(key, value)
  },

  setFlash: async (key: keyof SessionFlashDataTypes, value: any) => {
    const session = await getSession(
      request.headers.get("Cookie")
    )

    session.flash(key, value)
  },

  commit: async () => {
    const session = await getSession(
      request.headers.get("Cookie")
    )

    return await commitSession(session)
  },

  destroy: async () => {
    const session = await getSession(
      request.headers.get("Cookie")
    )
    return await destroySession(session)
  },

  data: async () => {
    const session = await getSession(
     request.headers.get("Cookie")
    )

    destroySession(session)
  }
})

export { session }
