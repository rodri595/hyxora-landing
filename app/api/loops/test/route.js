export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_LOOPS_API_KEY;

    if (!apiKey) {
        return Response.json({ error: "LOOPS_API_KEY is not set" }, { status: 500 });
    }

    const res = await fetch("https://app.loops.so/api/v1/api-key", {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
}
