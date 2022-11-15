export default cachedEventHandler(async(event) => {
  const { owner, repo } = event.context.params
  const { GitHub } = useRuntimeConfig()

  let contributors: any[] = []

  for (let i = 1; i <= 5; i++) {
    const temp = await $fetch<any[]>(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${GitHub}`,
      },
      params: { per_page: 100, page: i },
    })

    if (temp.length === 0) break

    contributors = contributors.concat(temp)
  }

  let [body, x, y] = ['', -24, 2]

  for (const i in contributors) {
    const { html_url, login, avatar_url } = contributors[i]
    const avatar = Buffer.from(await $fetch(avatar_url, {
      params: { s: 24 },
      responseType: 'arrayBuffer',
    })).toString('base64')

    x += 26
    if (x === 886) {
      y += 26
      x = 2
    }

    body += `
      <a
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xlink:href="${html_url}"
        target="_blank"
        rel="nofollow"
        id="${login}"
      >
        <image x="${x}" y="${y}" width="24" height="24" xlink:href="data:image/png;base64,${avatar}"/>
      </a>`
  }

  event.res.setHeader('content-type', 'image/svg+xml; charset=utf-8')
  event.res.end(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="890" height="262">
      ${body}
    </svg>
  `)
})
