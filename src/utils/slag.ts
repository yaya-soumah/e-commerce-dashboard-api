export const generateSlug = (name: string) => {
  return name
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/, '-')
    .replace(/(^-|-$)/g, '')
}
