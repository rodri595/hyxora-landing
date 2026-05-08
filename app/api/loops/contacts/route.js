export async function POST(request) {
    const apiKey = process.env.NEXT_PUBLIC_LOOPS_API_KEY;

    if (!apiKey) {
        return Response.json({ success: false, message: "API key not configured" }, { status: 500 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    const { email, firstName, lastName, source, userGroup, userId } = body;

    if (!email) {
        return Response.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const res = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(source && { source }),
            ...(userGroup && { userGroup }),
            ...(userId && { userId }),
            source: source ?? "Landing page",
        }),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
}
