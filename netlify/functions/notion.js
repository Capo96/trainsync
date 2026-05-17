const NOTION_TOKEN = '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';
const STRAVA_CLIENT_ID = '246761';
const STRAVA_CLIENT_SECRET = '824d5d4abbf22903c5db6014e2a5a9892ed1daeb';
const STRAVA_REFRESH_TOKEN = 'e21590e96d19cdcd06633ffe91098ac25a12b533';

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  const action = event.queryStringParameters?.action || '';

  // Exchange code for tokens
  if (action === 'exchange') {
    const code = event.queryStringParameters?.code || '';
    try {
      const resp = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code'
        })
      });
      const data = await resp.json();
      return { statusCode: resp.status, headers, body: JSON.stringify(data) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // Refresh access token
  if (action === 'strava_refresh') {
    try {
      const resp = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token'
        })
      });
      const data = await resp.json();
      return { statusCode: resp.status, headers, body: JSON.stringify(data) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // Notion proxy
  const endpoint = event.queryStringParameters?.endpoint || '';
  if (endpoint) {
    try {
      const url = 'https://api.notion.com/v1/' + endpoint;
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + NOTION_TOKEN,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();
      return { statusCode: resp.status, headers, body: JSON.stringify(data) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing action or endpoint' }) };
};
