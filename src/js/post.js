window.post = async (url, body, formatType) => {
    const res = await fetch(url, {
        method: (body && body.method) || 'POST',
        headers: { 'content-type': 'application/json' },
        body: (body && body.method) ? null : JSON.stringify(body)
    });
    const result = await res[formatType || "json"]();
    return result
}