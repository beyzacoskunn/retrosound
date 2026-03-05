export type CD = {
  id: string
  title: string
  color: string
  playlistUrl: string
  coverImage?: string | null
}

// CD'yi tarayıcı hafızasına kaydeder
export function saveCD(cd: CD) {
  if (typeof window !== "undefined") {
    const existingCDs = JSON.parse(localStorage.getItem("my_cds") || "{}")
    existingCDs[cd.id] = cd
    localStorage.setItem("my_cds", JSON.stringify(existingCDs))
  }
}

// CD'yi tarayıcı hafızasından okur
export function getCD(id: string): CD | undefined {
  if (typeof window !== "undefined") {
    const existingCDs = JSON.parse(localStorage.getItem("my_cds") || "{}")
    return existingCDs[id]
  }
  return undefined
}