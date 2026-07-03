type Response = {
  status: boolean
  data: any,
  message: any
}

const apiUrl = process.env.API_URL

async function createFile({
  file,
  token
}: {
  file: File
  token: string
}): Promise<Response> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${apiUrl}/file`, {
    method: 'POST',
    headers: {
      //'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    credentials: 'include',
  })

  return await response.json()
}

export const fileService = {
  createFile,
}
