const crypto = require("crypto");

const BASE_URL =
  process.env.SATISPAY_SANDBOX === "true"
    ? "https://staging.authservices.satispay.com"
    : "https://authservices.satispay.com";

const PATH = "/g_business/v1/payments";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const keyId = process.env.SATISPAY_KEY_ID;
  const privateKey = process.env.SATISPAY_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!keyId || !privateKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Credenziali Satispay non configurate" }),
    };
  }

  let amount;
  try {
    ({ amount } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Body non valido" }) };
  }

  const amountUnit = Math.round(amount * 100);
  const body = JSON.stringify({
    flow: "MATCH_CODE",
    amount_unit: amountUnit,
    currency: "EUR",
  });

  const date = new Date().toUTCString();
  const digest =
    "SHA-256=" + crypto.createHash("sha256").update(body).digest("base64");

  const stringToSign = `(request-target): post ${PATH}\ndate: ${date}\ndigest: ${digest}`;

  let signature;
  try {
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(stringToSign);
    signature = signer.sign(privateKey, "base64");
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Errore firma RSA: " + err.message }),
    };
  }

  const authHeader = `Signature keyId="${keyId}", algorithm="rsa-sha256", headers="(request-target) date digest", signature="${signature}"`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Date: date,
        Digest: digest,
      },
      body,
    });
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Errore connessione Satispay: " + err.message }),
    };
  }

  const data = await res.json();

  if (!res.ok) {
    return {
      statusCode: res.status,
      headers,
      body: JSON.stringify({ error: data }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      redirect_url: data.redirect_url,
      payment_id: data.id,
    }),
  };
};
