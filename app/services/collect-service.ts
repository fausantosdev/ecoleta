type Response = {
  status: boolean
  data: any,
  errors: any
}

const apiUrl = process.env.API_URL

async function createPoint({
  token,
  data: { image, name, email, whatsapp, latitude, longitude, uf, city, items }
}: {
  token: string,
  data: {
    image: string,
    name: string,
    email: string,
    whatsapp: string,
    latitude: number,
    longitude: number,
    uf: string,
    city: string,
    items: number[]
  }
}): Promise<Response> {
  const response = await fetch(`${apiUrl}/collection/points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      image,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      uf,
      city,
      items
    }),
    credentials: 'include',
  })

  return await response.json()
}

async function getItems({ token, id }: {
  token: string
  id?: number | string
}): Promise<Response> {

  const link = id ?
    `${apiUrl}/collection/items/${id}`:
    `${apiUrl}/collection/items`

  const response = await fetch(link, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
  })

  return await response.json()
}

export const collectService = {
  createPoint,
  getItems
}
