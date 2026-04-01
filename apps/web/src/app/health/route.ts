export async function GET(_request: Request) {
  return new Response('Health check OK', { status: 200 })
}
