const get = async (url, formatType = "text") => {
    const res = await fetch(url);
    const result = await res[formatType]();
    return result
}

const post = async (url, body = {}, formatType = "json") => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
    });
    const result = await res[formatType]();
    return result
}