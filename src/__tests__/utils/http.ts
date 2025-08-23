const mockHttp = {
  response: () => {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.cookie = jest.fn().mockReturnValue(res)
    res.clearCookie = jest.fn().mockReturnValue(res)
    return res
  },
  request: ({ body = {}, params = {}, query = {}, cookies = {} }) => ({
    body,
    params,
    query,
    cookies,
  }),
}

export default mockHttp
