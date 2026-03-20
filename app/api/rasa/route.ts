const RASA_WEBHOOK_URL = process.env.RASA_WEBHOOK_URL || 'http://localhost:8000/webhooks/rest/webhook'

export async function POST(req: Request) {
  const { sender, message } = await req.json()

  const rasaResponse = await fetch(RASA_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, message }),
  })

  if (!rasaResponse.ok) {
    return new Response(
      JSON.stringify({ error: `Rasa server error: ${rasaResponse.status}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const data = await rasaResponse.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}
