const { protocol, hostname, port } = window.location;
const dev = false
export const address = dev?"http://localhost:8000":`${protocol}//${hostname}:${port}`
