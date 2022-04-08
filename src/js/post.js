window.post = async (url, body, formatType) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await res[formatType || "json"]();
    return result
}