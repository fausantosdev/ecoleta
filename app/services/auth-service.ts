type Response = {
  status: boolean
  data: any,
  message: any
}

async function signIn({ email, password }: {
  email: string
  password: string
}): Promise<Response> {

  const response = await fetch(`${process.env.API_URL}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  return await response.json()
}

export const authService = {
  signIn
}
