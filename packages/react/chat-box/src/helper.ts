/* eslint-disable no-undef */

export const apiFetch = async (
  url: string,
  token?: string | RequestInit,
  options?: RequestInit,
) => {
  const opt = typeof token === 'string' ? options : token
  const tok = typeof token === 'string' ? token : undefined

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (tok) {
    headers.Authorization = `Bearer ${tok}`
  }

  const res = await fetch(url, {
    headers: {
      ...headers,
      ...opt?.headers,
    },
    ...opt,
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${res.status} ${res.statusText}`)
  }

  return await res.json()
}

export const Result = {
  try: async <T>(p: Promise<T>): Promise<[T | null, Error | null]> => {
    try {
      return [await p, null]
    } catch (e) {
      return [null, e]
    }
  },
}
